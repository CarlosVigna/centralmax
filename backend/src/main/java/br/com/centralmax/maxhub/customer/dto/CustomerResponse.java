package br.com.centralmax.maxhub.customer.dto;

import br.com.centralmax.maxhub.customer.CustomerOrigin;
import br.com.centralmax.maxhub.customer.CustomerStatus;
import br.com.centralmax.maxhub.customer.CustomerType;

import java.time.Instant;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String document,
        CustomerStatus status,
        String statusLabel,
        CustomerType customerType,
        CustomerOrigin origin,
        String originLabel,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {

    public static String labelOf(CustomerStatus status) {
        return switch (status) {
            case PROSPECT -> "Prospect";
            case ATIVO -> "Ativo";
            case INATIVO -> "Inativo";
        };
    }

    public static String labelOf(CustomerOrigin origin) {
        return switch (origin) {
            case LANDING -> "Landing Page";
            case WHATSAPP -> "WhatsApp";
            case INSTAGRAM -> "Instagram";
            case FACEBOOK -> "Facebook";
            case MERCADO_LIVRE -> "Mercado Livre";
            case SHOPEE -> "Shopee";
            case TIKTOK -> "TikTok";
            case VISITA -> "Visita";
            case INDICACAO -> "Indicação";
            case TELEFONE -> "Telefone";
        };
    }
}
