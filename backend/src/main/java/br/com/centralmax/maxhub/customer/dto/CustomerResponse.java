package br.com.centralmax.maxhub.customer.dto;

import br.com.centralmax.maxhub.customer.CustomerOrigin;
import br.com.centralmax.maxhub.customer.CustomerStatus;
import br.com.centralmax.maxhub.customer.CustomerType;
import br.com.centralmax.maxhub.customer.ProspectStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
        String addressStreet,
        String addressNumber,
        String addressComplement,
        String addressNeighborhood,
        String addressCity,
        String addressState,
        String addressZip,
        String fullAddress,
        Integer contactCadenceDays,
        LocalDate nextContactDate,
        LocalDateTime lastContactedAt,
        String cadenceLabel,
        boolean isContactDue,
        // Perfil Comercial
        Integer commercialPotential,
        String commercialNotes,
        String businessType,
        ProspectStatus prospectStatus,
        String prospectStatusLabel,
        String lostReason,
        BigDecimal averageTicket,
        BigDecimal totalPurchased,
        LocalDate lastPurchaseDate,
        BigDecimal overdueAmount,
        int overdueCount,
        List<String> favoriteProducts,
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

    public static String labelOf(ProspectStatus status) {
        if (status == null) return null;
        return switch (status) {
            case NAO_VISITADO -> "Não visitado";
            case VISITADO -> "Visitado";
            case INTERESSADO -> "Interessado";
            case ORCAMENTO_ENVIADO -> "Orçamento enviado";
            case NEGOCIANDO -> "Negociando";
            case CONVERTIDO -> "Convertido";
            case PERDIDO -> "Perdido";
        };
    }
}
