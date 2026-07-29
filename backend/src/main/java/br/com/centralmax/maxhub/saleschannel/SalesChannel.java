package br.com.centralmax.maxhub.saleschannel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sales_channels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "fixed_fee", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal fixedFee = BigDecimal.ZERO;

    @Column(name = "variable_fee_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal variableFeePercent = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "fee_base", nullable = false, length = 20)
    @Builder.Default
    private FeeBase feeBase = FeeBase.TOTAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_responsibility", length = 20)
    @Builder.Default
    private ShippingResponsibility shippingResponsibility = ShippingResponsibility.CLIENT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        active = true;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
