package br.com.centralmax.maxhub.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    Long nextOrderNumber();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN :statuses AND o.active = true")
    long countByStatusInAndActive(@Param("statuses") List<OrderStatus> statuses);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.active = true")
    long countByStatusAndActive(@Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :start AND o.createdAt < :end AND o.active = true")
    long countCreatedBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status IN :statuses AND o.active = true ORDER BY o.createdAt ASC")
    List<Order> findBoardOrders(@Param("statuses") List<OrderStatus> statuses);

    List<Order> findTop5ByStatusAndActiveOrderByCreatedAtDesc(OrderStatus status, boolean active);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product p WHERE o.status IN :statuses AND o.active = true ORDER BY o.createdAt ASC")
    List<Order> findAllByStatusInWithItems(@Param("statuses") List<OrderStatus> statuses);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.customer c LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.status IN :statuses AND o.createdAt >= :start AND o.createdAt < :end AND o.active = true ORDER BY o.createdAt ASC")
    List<Order> findDeliveryOrders(@Param("statuses") List<OrderStatus> statuses, @Param("start") java.time.Instant start, @Param("end") java.time.Instant end);

    // ── Report queries ────────────────────────────────────────────────

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.createdAt >= :start AND o.createdAt < :end AND o.active = true AND o.status <> :excluded")
    java.math.BigDecimal sumRevenueInPeriod(@Param("start") Instant start,
                                            @Param("end") Instant end,
                                            @Param("excluded") OrderStatus excluded);

    @Query(value = """
            SELECT o.status, COUNT(*) AS cnt
            FROM orders o
            WHERE o.created_at >= :start AND o.created_at < :end AND o.active = true
            GROUP BY o.status
            """, nativeQuery = true)
    List<Object[]> countByStatusInPeriod(@Param("start") Instant start, @Param("end") Instant end);

    @Query(value = """
            SELECT oi.product_name,
                   SUM(oi.quantity)   AS qty,
                   COALESCE(SUM(oi.subtotal), 0) AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.created_at >= :start AND o.created_at < :end
              AND o.active = true AND o.status != 'CANCELADO'
            GROUP BY oi.product_name
            ORDER BY qty DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> findTopProductsInPeriod(@Param("start") Instant start, @Param("end") Instant end);

    @Query(value = """
            SELECT DATE(o.created_at AT TIME ZONE 'UTC')            AS day,
                   COALESCE(SUM(o.total_amount), 0)                 AS revenue,
                   COUNT(*)                                          AS orders
            FROM orders o
            WHERE o.created_at >= :start AND o.created_at < :end
              AND o.active = true AND o.status != 'CANCELADO'
            GROUP BY DATE(o.created_at AT TIME ZONE 'UTC')
            ORDER BY day
            """, nativeQuery = true)
    List<Object[]> findRevenueByDayInPeriod(@Param("start") Instant start, @Param("end") Instant end);
}
