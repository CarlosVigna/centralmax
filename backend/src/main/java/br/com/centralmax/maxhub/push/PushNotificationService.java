package br.com.centralmax.maxhub.push;

import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PushNotificationService {

    @Value("${app.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${app.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${app.vapid.subject:mailto:admin@centralmax.com.br}")
    private String vapidSubject;

    private final PushSubscriptionRepository repository;

    public PushNotificationService(PushSubscriptionRepository repository) {
        this.repository = repository;
    }

    public void sendToAll(String title, String body) {
        if (vapidPublicKey == null || vapidPublicKey.isBlank()
                || vapidPrivateKey == null || vapidPrivateKey.isBlank()) {
            log.debug("VAPID keys not configured — skipping push notification");
            return;
        }
        sendToSubscriptions(repository.findAll(), title, body);
    }

    public void sendToSubscriptions(List<PushSubscription> subscriptions, String title, String body) {
        if (vapidPublicKey == null || vapidPublicKey.isBlank()) return;

        String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\"}",
                escape(title), escape(body));

        try {
            PushService pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            for (PushSubscription sub : subscriptions) {
                try {
                    Notification notification = new Notification(
                            sub.getEndpoint(), sub.getP256dh(), sub.getAuth(), payload.getBytes());
                    pushService.send(notification);
                } catch (Exception e) {
                    log.warn("Push failed for {}: {}", sub.getEndpoint(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("PushService init failed: {}", e.getMessage());
        }
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
