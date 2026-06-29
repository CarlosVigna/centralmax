package br.com.centralmax.maxhub.user.dto;

import br.com.centralmax.maxhub.user.UserRole;

import java.util.UUID;

public record UserResponse(UUID id, String name, String email, UserRole role) {
}
