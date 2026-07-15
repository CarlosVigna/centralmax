package br.com.centralmax.maxhub.user.dto;

import br.com.centralmax.maxhub.user.UserRole;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        boolean active,
        Instant createdAt,
        BigDecimal commissionPriceA,
        BigDecimal commissionPriceB,
        BigDecimal commissionPriceC,
        String territory
) {}
