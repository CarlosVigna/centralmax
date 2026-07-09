package br.com.centralmax.maxhub.crm;

import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.crm.dto.CompleteScheduleRequest;
import br.com.centralmax.maxhub.crm.dto.ContactScheduleRequest;
import br.com.centralmax.maxhub.crm.dto.ContactScheduleResponse;
import br.com.centralmax.maxhub.customer.Customer;
import br.com.centralmax.maxhub.customer.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactScheduleService {

    private final ContactScheduleRepository scheduleRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<ContactScheduleResponse> getSchedulesByCustomer(UUID customerId) {
        return scheduleRepository.findByCustomerIdOrderByScheduledDateDesc(customerId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ContactScheduleResponse> getAgenda(String period, UUID customerId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        List<ContactSchedule> schedules;

        switch (period == null ? "today" : period) {
            case "tomorrow" -> schedules = scheduleRepository.findByScheduledDateAndStatus(
                    today.plusDays(1), ContactScheduleStatus.PENDENTE);
            case "week" -> schedules = scheduleRepository.findByScheduledDateBetweenAndStatus(
                    today, today.plusDays(6), ContactScheduleStatus.PENDENTE);
            case "month" -> schedules = scheduleRepository.findByScheduledDateBetweenAndStatus(
                    today, today.plusDays(29), ContactScheduleStatus.PENDENTE);
            case "overdue" -> schedules = scheduleRepository.findOverdue(today, ContactScheduleStatus.PENDENTE);
            default -> schedules = scheduleRepository.findByScheduledDateAndStatus(today, ContactScheduleStatus.PENDENTE);
        }

        if (customerId != null) {
            schedules = schedules.stream()
                    .filter(s -> s.getCustomer().getId().equals(customerId))
                    .toList();
        }
        return schedules.stream().map(this::toResponse).toList();
    }

    @Transactional
    public ContactScheduleResponse createManualSchedule(UUID customerId, ContactScheduleRequest request) {
        Customer customer = findCustomerOrThrow(customerId);
        ContactSchedule schedule = ContactSchedule.builder()
                .customer(customer)
                .scheduledDate(request.scheduledDate())
                .reason(request.reason())
                .status(ContactScheduleStatus.PENDENTE)
                .build();
        return toResponse(scheduleRepository.save(schedule));
    }

    @Transactional
    public ContactScheduleResponse completeSchedule(UUID scheduleId, CompleteScheduleRequest request) {
        ContactSchedule schedule = findOrThrow(scheduleId);
        schedule.setStatus(ContactScheduleStatus.REALIZADO);
        schedule.setNotes(request != null ? request.notes() : null);
        schedule.setCompletedAt(Instant.now());

        Customer customer = schedule.getCustomer();
        customer.setLastContactedAt(java.time.LocalDateTime.now(ZoneOffset.UTC));

        LocalDate nextDate = null;
        if (customer.getContactCadenceDays() != null && customer.getContactCadenceDays() > 0) {
            nextDate = schedule.getScheduledDate().plusDays(customer.getContactCadenceDays());
            customer.setNextContactDate(nextDate);
            customerRepository.save(customer);
            ContactSchedule next = ContactSchedule.builder()
                    .customer(customer)
                    .scheduledDate(nextDate)
                    .reason(schedule.getReason())
                    .status(ContactScheduleStatus.PENDENTE)
                    .build();
            scheduleRepository.save(next);
        } else {
            customerRepository.save(customer);
        }

        ContactSchedule saved = scheduleRepository.save(schedule);
        return toResponse(saved, nextDate);
    }

    @Transactional
    public ContactScheduleResponse cancelSchedule(UUID scheduleId) {
        ContactSchedule schedule = findOrThrow(scheduleId);
        schedule.setStatus(ContactScheduleStatus.CANCELADO);
        return toResponse(scheduleRepository.save(schedule));
    }

    public void generateNextSchedule(Customer customer) {
        if (customer.getContactCadenceDays() == null || customer.getContactCadenceDays() <= 0) return;
        // Check if there's already a pending schedule
        scheduleRepository.findFirstPendingByCustomerId(customer.getId(), ContactScheduleStatus.PENDENTE)
                .ifPresentOrElse(
                        existing -> {}, // already has one, do nothing
                        () -> {
                            LocalDate date = customer.getNextContactDate() != null
                                    ? customer.getNextContactDate()
                                    : LocalDate.now(ZoneOffset.UTC);
                            customer.setNextContactDate(date);
                            customerRepository.save(customer);
                            ContactSchedule schedule = ContactSchedule.builder()
                                    .customer(customer)
                                    .scheduledDate(date)
                                    .reason("Contato programado")
                                    .status(ContactScheduleStatus.PENDENTE)
                                    .build();
                            scheduleRepository.save(schedule);
                        }
                );
    }

    private ContactSchedule findOrThrow(UUID id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
    }

    private Customer findCustomerOrThrow(UUID id) {
        return customerRepository.findById(id)
                .filter(Customer::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
    }

    private ContactScheduleResponse toResponse(ContactSchedule s) {
        return toResponse(s, null);
    }

    private ContactScheduleResponse toResponse(ContactSchedule s, LocalDate nextDate) {
        Customer c = s.getCustomer();
        return new ContactScheduleResponse(
                s.getId(),
                c.getId(),
                c.getName(),
                c.getPhone(),
                c.getStatus().name(),
                s.getScheduledDate(),
                s.getReason(),
                s.getStatus(),
                s.getNotes(),
                s.getCompletedAt(),
                s.getCreatedAt(),
                nextDate != null ? nextDate : c.getNextContactDate()
        );
    }
}
