package br.com.centralmax.maxhub.product.history;

import br.com.centralmax.maxhub.product.Product;
import br.com.centralmax.maxhub.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
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
@Table(name = "product_price_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "old_purchase_price", precision = 15, scale = 2)
    private BigDecimal oldPurchasePrice;

    @Column(name = "new_purchase_price", precision = 15, scale = 2)
    private BigDecimal newPurchasePrice;

    @Column(name = "old_price_a", precision = 15, scale = 2)
    private BigDecimal oldPriceA;

    @Column(name = "new_price_a", precision = 15, scale = 2)
    private BigDecimal newPriceA;

    @Column(name = "old_price_b", precision = 15, scale = 2)
    private BigDecimal oldPriceB;

    @Column(name = "new_price_b", precision = 15, scale = 2)
    private BigDecimal newPriceB;

    @Column(name = "old_price_c", precision = 15, scale = 2)
    private BigDecimal oldPriceC;

    @Column(name = "new_price_c", precision = 15, scale = 2)
    private BigDecimal newPriceC;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @PrePersist
    void prePersist() {
        changedAt = Instant.now();
    }
}
