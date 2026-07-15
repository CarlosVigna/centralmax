package br.com.centralmax.maxhub.user.dto;

import br.com.centralmax.maxhub.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UserRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String password,
        @NotNull UserRole role,
        BigDecimal commissionPriceA,
        BigDecimal commissionPriceB,
        BigDecimal commissionPriceC,
        String territory
) {}
