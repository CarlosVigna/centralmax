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
}
