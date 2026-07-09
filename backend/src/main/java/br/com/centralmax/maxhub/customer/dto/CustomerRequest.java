package br.com.centralmax.maxhub.customer.dto;

import br.com.centralmax.maxhub.customer.CustomerOrigin;
import br.com.centralmax.maxhub.customer.CustomerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 160, message = "Nome deve ter entre 2 e 160 caracteres")
        String name,

        @Email(message = "E-mail inválido")
        @Size(max = 160, message = "E-mail deve ter no máximo 160 caracteres")
        String email,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String phone,

        @Size(max = 20, message = "Documento deve ter no máximo 20 caracteres")
        String document,

        CustomerStatus status,

        @NotNull(message = "Origem é obrigatória")
        CustomerOrigin origin,

        @Size(max = 2000, message = "Observações devem ter no máximo 2000 caracteres")
        String notes,

        @Size(max = 255)
        String addressStreet,

        @Size(max = 20)
        String addressNumber,

        @Size(max = 100)
        String addressComplement,

        @Size(max = 100)
        String addressNeighborhood,

        @Size(max = 100)
        String addressCity,

        @Size(max = 2)
        String addressState,

        @Size(max = 10)
        String addressZip
) {}
