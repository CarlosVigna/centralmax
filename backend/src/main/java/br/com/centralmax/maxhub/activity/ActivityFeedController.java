package br.com.centralmax.maxhub.activity;

import br.com.centralmax.maxhub.activity.dto.ActivityFeedResponse;
import br.com.centralmax.maxhub.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity-feed")
@RequiredArgsConstructor
public class ActivityFeedController {

    private final ActivityFeedService service;

    @GetMapping
    public ResponseEntity<PageResponse<ActivityFeedResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(service.list(page, size));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityFeedResponse>> recent(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.listRecent(limit));
    }
}
