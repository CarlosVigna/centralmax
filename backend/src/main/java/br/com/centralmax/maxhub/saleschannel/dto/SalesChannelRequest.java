package br.com.centralmax.maxhub.saleschannel.dto;

import br.com.centralmax.maxhub.saleschannel.FeeBase;
import br.com.centralmax.maxhub.saleschannel.ShippingResponsibility;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SalesChannelRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String name,

        @NotNull(message = "Taxa fixa é obrigatória")
        @DecimalMin(value = "0", message = "Taxa fixa não pode ser negativa")
        BigDecimal fixedFee,

        @NotNull(message = "Taxa variável é obrigatória")
        @DecimalMin(value = "0", message = "Taxa variável não pode ser negativa")
        @DecimalMax(value = "100", message = "Taxa variável não pode ser maior que 100%")
        BigDecimal variableFeePercent,

        @NotNull(message = "Base de cálculo é obrigatória")
        FeeBase feeBase,

        ShippingResponsibility shippingResponsibility,

        @Size(max = 2000, message = "Observações devem ter no máximo 2000 caracteres")
        String notes
) {}
