package br.com.centralmax.maxhub.financial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface FinancialEntryRepository extends JpaRepository<FinancialEntry, UUID>,
        JpaSpecificationExecutor<FinancialEntry> {

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
}
