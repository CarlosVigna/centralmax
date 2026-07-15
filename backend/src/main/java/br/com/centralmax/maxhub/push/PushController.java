package br.com.centralmax.maxhub.push;

import br.com.centralmax.maxhub.push.dto.PushSubscriptionRequest;
import br.com.centralmax.maxhub.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushController {

    private final PushSubscriptionRepository repository;
    private final SecurityUtils securityUtils;

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@Valid @RequestBody PushSubscriptionRequest request) {
        var user = securityUtils.getCurrentUser().orElseThrow();
        repository.findByEndpoint(request.endpoint()).ifPresent(repository::delete);
        PushSubscription sub = PushSubscription.builder()
                .userId(user.getId())
                .endpoint(request.endpoint())
                .p256dh(request.p256dh())
                .auth(request.auth())
                .build();
        repository.save(sub);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@RequestBody PushSubscriptionRequest request) {
        repository.findByEndpoint(request.endpoint()).ifPresent(repository::delete);
        return ResponseEntity.ok().build();
    }
}
