package br.com.centralmax.maxhub.financial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface FinancialEntryRepository extends JpaRepository<FinancialEntry, UUID>,
        JpaSpecificationExecutor<FinancialEntry> {

    boolean existsByOrderId(UUID orderId);

    Optional<FinancialEntry> findFirstByOrderId(UUID orderId);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FinancialEntry f " +
           "WHERE f.type = :type AND f.status = :status " +
           "AND f.paidAt >= :start AND f.paidAt < :end")
    BigDecimal sumPaidByTypeAndStatusInPeriod(@Param("type") FinancialEntryType type,
                                              @Param("status") FinancialEntryStatus status,
                                              @Param("start") Instant start,
                                              @Param("end") Instant end);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FinancialEntry f " +
           "WHERE f.type = :type AND f.status = :status")
    BigDecimal sumByTypeAndStatus(@Param("type") FinancialEntryType type,
                                  @Param("status") FinancialEntryStatus status);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FinancialEntry f " +
           "WHERE f.type = :type AND f.status = :status " +
           "AND f.dueDate IS NOT NULL AND f.dueDate < :today")
    BigDecimal sumOverdue(@Param("type") FinancialEntryType type,
                          @Param("status") FinancialEntryStatus status,
                          @Param("today") LocalDate today);

    @Query("SELECT COUNT(f) FROM FinancialEntry f " +
           "WHERE f.type = :type AND f.status = :status " +
           "AND f.dueDate IS NOT NULL AND f.dueDate < :today")
    long countOverdue(@Param("type") FinancialEntryType type,
                      @Param("status") FinancialEntryStatus status,
                      @Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FinancialEntry f " +
           "WHERE f.type = :type AND f.status = :status AND f.dueDate = :date")
    BigDecimal sumByTypeAndStatusAndDueDate(@Param("type") FinancialEntryType type,
                                            @Param("status") FinancialEntryStatus status,
                                            @Param("date") LocalDate date);
}
