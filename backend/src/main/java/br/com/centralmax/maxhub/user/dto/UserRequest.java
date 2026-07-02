package br.com.centralmax.maxhub.user.dto;

import br.com.centralmax.maxhub.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String password,
        @NotNull UserRole role
) {}
