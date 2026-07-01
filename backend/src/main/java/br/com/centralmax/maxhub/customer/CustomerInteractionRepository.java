package br.com.centralmax.maxhub.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface CustomerInteractionRepository extends JpaRepository<CustomerInteraction, UUID> {

    List<CustomerInteraction> findByCustomerIdAndActiveOrderByCreatedAtDesc(UUID customerId, boolean active);

    @Query("SELECT i FROM CustomerInteraction i JOIN FETCH i.customer WHERE i.active = true " +
           "AND i.scheduledAt IS NOT NULL AND i.completedAt IS NULL " +
           "AND i.scheduledAt >= :from AND i.scheduledAt < :to ORDER BY i.scheduledAt ASC")
    List<CustomerInteraction> findScheduledBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT i FROM CustomerInteraction i JOIN FETCH i.customer WHERE i.active = true " +
           "AND i.scheduledAt IS NOT NULL AND i.completedAt IS NULL " +
           "AND i.scheduledAt < :now ORDER BY i.scheduledAt ASC")
    List<CustomerInteraction> findOverdue(@Param("now") Instant now);

    @Query("SELECT COUNT(i) FROM CustomerInteraction i WHERE i.active = true " +
           "AND i.scheduledAt IS NOT NULL AND i.completedAt IS NULL " +
           "AND i.scheduledAt >= :from AND i.scheduledAt < :to")
    long countScheduledBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COUNT(i) FROM CustomerInteraction i WHERE i.active = true " +
           "AND i.scheduledAt IS NOT NULL AND i.completedAt IS NULL " +
           "AND i.scheduledAt < :now")
    long countOverdue(@Param("now") Instant now);
}
