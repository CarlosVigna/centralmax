package br.com.centralmax.maxhub.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/summary")
    public ResponseEntity<NotificationSummaryResponse> getSummary() {
        return ResponseEntity.ok(notificationService.getSummary());
    }
}
