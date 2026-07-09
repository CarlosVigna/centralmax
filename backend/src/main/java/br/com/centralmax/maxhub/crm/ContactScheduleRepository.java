package br.com.centralmax.maxhub.crm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContactScheduleRepository extends JpaRepository<ContactSchedule, UUID> {

    @Query("SELECT s FROM ContactSchedule s JOIN FETCH s.customer WHERE s.customer.id = :customerId ORDER BY s.scheduledDate DESC")
    List<ContactSchedule> findByCustomerIdOrderByScheduledDateDesc(@Param("customerId") UUID customerId);

    @Query("SELECT s FROM ContactSchedule s JOIN FETCH s.customer c WHERE s.scheduledDate BETWEEN :start AND :end AND s.status = :status ORDER BY s.scheduledDate ASC, c.name ASC")
    List<ContactSchedule> findByScheduledDateBetweenAndStatus(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("status") ContactScheduleStatus status);

    @Query("SELECT s FROM ContactSchedule s JOIN FETCH s.customer c WHERE s.scheduledDate = :date AND s.status = :status ORDER BY c.name ASC")
    List<ContactSchedule> findByScheduledDateAndStatus(@Param("date") LocalDate date, @Param("status") ContactScheduleStatus status);

    @Query("SELECT COUNT(s) FROM ContactSchedule s WHERE s.scheduledDate = :date AND s.status = :status")
    long countByScheduledDateAndStatus(@Param("date") LocalDate date, @Param("status") ContactScheduleStatus status);

    @Query("SELECT s FROM ContactSchedule s JOIN FETCH s.customer c WHERE s.scheduledDate < :today AND s.status = :status ORDER BY s.scheduledDate ASC, c.name ASC")
    List<ContactSchedule> findOverdue(@Param("today") LocalDate today, @Param("status") ContactScheduleStatus status);

    @Query("SELECT COUNT(s) FROM ContactSchedule s WHERE s.scheduledDate < :today AND s.status = :status")
    long countOverdue(@Param("today") LocalDate today, @Param("status") ContactScheduleStatus status);

    @Query("SELECT s FROM ContactSchedule s WHERE s.customer.id = :customerId AND s.status = :status ORDER BY s.scheduledDate ASC")
    Optional<ContactSchedule> findFirstPendingByCustomerId(@Param("customerId") UUID customerId, @Param("status") ContactScheduleStatus status);
}
