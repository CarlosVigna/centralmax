package br.com.centralmax.maxhub.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(min = 2, max = 80) String name
) {
}
