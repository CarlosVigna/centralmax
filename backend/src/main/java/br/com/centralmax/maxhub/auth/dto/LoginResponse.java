package br.com.centralmax.maxhub.auth.dto;

import br.com.centralmax.maxhub.user.dto.UserResponse;

public record LoginResponse(String token, long expiresIn, UserResponse user) {
}
