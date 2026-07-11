package br.com.centralmax.maxhub.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID>, JpaSpecificationExecutor<Customer> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    // ── Report queries ────────────────────────────────────────────────

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt >= :start AND c.createdAt < :end AND c.active = true")
    long countNewInPeriod(@Param("start") Instant start, @Param("end") Instant end);

    @Query(value = """
            SELECT c.status, COUNT(*) AS cnt
            FROM customers c
            WHERE c.active = true
            GROUP BY c.status
            """, nativeQuery = true)
    List<Object[]> countByStatus();

    @Query(value = """
            SELECT c.origin, COUNT(*) AS cnt
            FROM customers c
            WHERE c.active = true
            GROUP BY c.origin
            """, nativeQuery = true)
    List<Object[]> countByOrigin();

    @Query(value = """
            SELECT c.name,
                   COUNT(o.id)                        AS total_orders,
                   COALESCE(SUM(o.total_amount), 0)   AS total_spent
            FROM customers c
            JOIN orders o ON o.customer_id = c.id
            WHERE o.active = true AND o.status != 'CANCELADO'
            GROUP BY c.id, c.name
            ORDER BY total_spent DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> findTopCustomers();

    // ── Stats para CRM avançado ───────────────────────────────────────

    @Query(value = """
            SELECT COALESCE(AVG(o.total_amount), 0), COALESCE(SUM(o.total_amount), 0),
                   MAX(CAST(o.created_at AS date))
            FROM orders o
            WHERE o.customer_id = :customerId AND o.active = true AND o.status = 'CONCLUIDO'
            """, nativeQuery = true)
    Object[] findCustomerStats(@Param("customerId") UUID customerId);

    @Query(value = """
            SELECT p.name
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.customer_id = :customerId AND o.active = true AND o.status != 'CANCELADO'
            GROUP BY p.id, p.name
            ORDER BY SUM(oi.quantity) DESC
            LIMIT 3
            """, nativeQuery = true)
    List<String> findFavoriteProducts(@Param("customerId") UUID customerId);

    @Query(value = """
            SELECT COALESCE(SUM(fe.amount), 0) AS overdue_amount, COUNT(fe.id) AS overdue_count
            FROM financial_entries fe
            JOIN orders o ON fe.order_id = o.id
            WHERE o.customer_id = :customerId
            AND fe.status = 'PENDENTE'
            AND fe.due_date < CURRENT_DATE
            """, nativeQuery = true)
    Object[] findOverdueData(@Param("customerId") UUID customerId);

    @Query("SELECT c FROM Customer c WHERE c.active = true AND c.status = :status AND (c.lastPurchaseDate IS NULL OR c.lastPurchaseDate < :cutoffDate) ORDER BY c.lastPurchaseDate ASC")
    java.util.List<Customer> findCustomersToReactivate(
            @Param("status") CustomerStatus status,
            @Param("cutoffDate") java.time.LocalDate cutoffDate);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.active = true AND c.status = :status AND (c.lastPurchaseDate IS NULL OR c.lastPurchaseDate < :cutoffDate)")
    long countCustomersToReactivate(
            @Param("status") CustomerStatus status,
            @Param("cutoffDate") java.time.LocalDate cutoffDate);
}
