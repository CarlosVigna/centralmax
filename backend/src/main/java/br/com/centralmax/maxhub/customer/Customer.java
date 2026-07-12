package br.com.centralmax.maxhub.customer;

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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(length = 20)
    private String document;

    @Column(name = "document_type", length = 10)
    private String documentType;

    @Column(length = 20)
    private String phone;

    @Column(length = 160)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(name = "address_street", length = 255)
    private String addressStreet;

    @Column(name = "address_number", length = 20)
    private String addressNumber;

    @Column(name = "address_complement", length = 100)
    private String addressComplement;

    @Column(name = "address_neighborhood", length = 100)
    private String addressNeighborhood;

    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_state", length = 2)
    private String addressState;

    @Column(name = "address_zip", length = 10)
    private String addressZip;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false, columnDefinition = "varchar(1)")
    private CustomerType customerType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerOrigin origin;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "contact_cadence_days")
    private Integer contactCadenceDays;

    @Column(name = "next_contact_date")
    private LocalDate nextContactDate;

    @Column(name = "last_contacted_at")
    private LocalDateTime lastContactedAt;

    @Column(name = "commercial_potential")
    private Integer commercialPotential;

    @Column(name = "commercial_notes", columnDefinition = "TEXT")
    private String commercialNotes;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Enumerated(EnumType.STRING)
    @Column(name = "prospect_status", length = 50)
    private ProspectStatus prospectStatus;

    @Column(name = "lost_reason", length = 255)
    private String lostReason;

    @Column(name = "average_ticket", precision = 15, scale = 2)
    private BigDecimal averageTicket;

    @Column(name = "total_purchased", precision = 15, scale = 2)
    private BigDecimal totalPurchased;

    @Column(name = "last_purchase_date")
    private LocalDate lastPurchaseDate;

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
        if (customerType == null) customerType = CustomerType.C;
        if (status == null) status = CustomerStatus.PROSPECT;
        active = true;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
