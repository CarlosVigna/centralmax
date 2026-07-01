package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.customer.dto.CustomerInteractionRequest;
import br.com.centralmax.maxhub.customer.dto.CustomerInteractionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerInteractionService {

    private final CustomerInteractionRepository interactionRepository;
    private final CustomerRepository customerRepository;
    private final CustomerInteractionMapper interactionMapper;

    @Transactional
    public CustomerInteractionResponse create(UUID customerId, CustomerInteractionRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        CustomerInteraction interaction = CustomerInteraction.builder()
                .customer(customer)
                .type(request.type())
                .notes(request.notes())
                .scheduledAt(request.scheduledAt())
                .build();

        return interactionMapper.toResponse(interactionRepository.save(interaction));
    }

    @Transactional(readOnly = true)
    public List<CustomerInteractionResponse> listByCustomer(UUID customerId) {
        return interactionRepository
                .findByCustomerIdAndActiveOrderByCreatedAtDesc(customerId, true)
                .stream()
                .map(interactionMapper::toResponse)
                .toList();
    }

    @Transactional
    public void delete(UUID customerId, UUID interactionId) {
        CustomerInteraction interaction = interactionRepository.findById(interactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interação não encontrada"));
        if (!interaction.getCustomer().getId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Interação não encontrada");
        }
        interaction.setActive(false);
    }

    @Transactional(readOnly = true)
    public List<CustomerInteractionResponse> getAgenda(String period) {
        Instant now = Instant.now();
        return switch (period) {
            case "today" -> {
                Instant start = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant end = start.plus(1, ChronoUnit.DAYS);
                yield interactionRepository.findScheduledBetween(start, end)
                        .stream().map(interactionMapper::toResponse).toList();
            }
            case "week" -> {
                Instant start = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant end = start.plus(7, ChronoUnit.DAYS);
                yield interactionRepository.findScheduledBetween(start, end)
                        .stream().map(interactionMapper::toResponse).toList();
            }
            case "overdue" -> interactionRepository.findOverdue(now)
                    .stream().map(interactionMapper::toResponse).toList();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "period deve ser today, week ou overdue");
        };
    }
}
