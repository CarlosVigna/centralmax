package br.com.centralmax.maxhub.activity;

import br.com.centralmax.maxhub.activity.dto.ActivityFeedResponse;
import br.com.centralmax.maxhub.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityFeedService {

    private final ActivityFeedRepository repository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(UUID userId, String userName, String actionType,
                    String entityType, UUID entityId, String entityLabel, String details) {
        ActivityFeedEntry entry = ActivityFeedEntry.builder()
                .userId(userId)
                .userName(userName)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .entityLabel(entityLabel)
                .details(details)
                .build();
        repository.save(entry);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivityFeedResponse> list(int page, int size) {
        return PageResponse.from(
                repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                        .map(this::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public java.util.List<ActivityFeedResponse> listRecent(int limit) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .map(this::toResponse)
                .toList();
    }

    private ActivityFeedResponse toResponse(ActivityFeedEntry e) {
        return new ActivityFeedResponse(e.getId(), e.getUserId(), e.getUserName(),
                e.getActionType(), e.getEntityType(), e.getEntityId(),
                e.getEntityLabel(), e.getDetails(), e.getCreatedAt());
    }
}
