package br.com.centralmax.maxhub.activity.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityFeedResponse(
        UUID id,
        UUID userId,
        String userName,
        String actionType,
        String entityType,
        UUID entityId,
        String entityLabel,
        String details,
        Instant createdAt
) {}
