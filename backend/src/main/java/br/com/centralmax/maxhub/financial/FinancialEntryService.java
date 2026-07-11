package br.com.centralmax.maxhub.financial;

import br.com.centralmax.maxhub.common.exception.BusinessException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.financial.dto.FinancialEntryRequest;
import br.com.centralmax.maxhub.financial.dto.FinancialEntryResponse;
import br.com.centralmax.maxhub.financial.dto.FinancialSummaryResponse;
import br.com.centralmax.maxhub.order.Order;
import br.com.centralmax.maxhub.order.OrderRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialEntryService {

    private final FinancialEntryRepository financialEntryRepository;
    private final OrderRepository orderRepository;
    private final FinancialEntryMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<FinancialEntryResponse> list(FinancialEntryType type, String statusParam,
                                                     LocalDate startDate, LocalDate endDate,
                                                     int page, int size) {
        boolean overdueOnly = "VENCIDO".equalsIgnoreCase(statusParam);
        FinancialEntryStatus status = null;
        if (!overdueOnly && statusParam != null && !statusParam.isEmpty()) {
            try {
                status = FinancialEntryStatus.valueOf(statusParam.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate").descending());
        Page<FinancialEntry> result = financialEntryRepository.findAll(
                buildSpec(type, status, startDate, endDate, overdueOnly), pageable);
        return PageResponse.from(result.map(mapper::toResponse));
    }

    @Transactional(readOnly = true)
    public FinancialEntryResponse getById(UUID id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getSummary(LocalDate startDate, LocalDate endDate) {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = startDate != null ? startDate : now.withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : now.withDayOfMonth(now.lengthOfMonth());

        Instant instantStart = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant instantEnd = end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        BigDecimal receitas = financialEntryRepository.sumPaidByTypeAndStatusInPeriod(
                FinancialEntryType.RECEITA, FinancialEntryStatus.PAGO, instantStart, instantEnd);
        BigDecimal despesas = financialEntryRepository.sumPaidByTypeAndStatusInPeriod(
                FinancialEntryType.DESPESA, FinancialEntryStatus.PAGO, instantStart, instantEnd);
        BigDecimal saldoMes = receitas.subtract(despesas);
        BigDecimal aReceber = financialEntryRepository.sumByTypeAndStatus(
                FinancialEntryType.RECEITA, FinancialEntryStatus.PENDENTE);
        BigDecimal receitasPendentes = financialEntryRepository.sumByTypeAndStatus(
                FinancialEntryType.RECEITA, FinancialEntryStatus.PENDENTE);
        BigDecimal despesasPendentes = financialEntryRepository.sumByTypeAndStatus(
                FinancialEntryType.DESPESA, FinancialEntryStatus.PENDENTE);
        BigDecimal vencidos = financialEntryRepository.sumOverdueAllTypes(
                FinancialEntryStatus.PENDENTE, now);

        return new FinancialSummaryResponse(saldoMes, aReceber, receitas, despesas, vencidos,
                receitasPendentes, despesasPendentes);
    }

    @Transactional
    public FinancialEntryResponse create(FinancialEntryRequest request) {
        FinancialEntry entry = mapper.toEntity(request);
        entry.setOrder(resolveOrder(request.orderId()));
        return mapper.toResponse(financialEntryRepository.save(entry));
    }

    @Transactional
    public FinancialEntryResponse update(UUID id, FinancialEntryRequest request) {
        FinancialEntry entry = findOrThrow(id);
        if (entry.getStatus() == FinancialEntryStatus.PAGO) {
            throw new BusinessException("Lançamento já pago não pode ser editado");
        }
        mapper.updateEntity(request, entry);
        entry.setOrder(resolveOrder(request.orderId()));
        return mapper.toResponse(financialEntryRepository.save(entry));
    }

    @Transactional
    public FinancialEntryResponse pay(UUID id) {
        FinancialEntry entry = findOrThrow(id);
        if (entry.getStatus() == FinancialEntryStatus.PAGO) {
            throw new BusinessException("Lançamento já está pago");
        }
        if (entry.getStatus() == FinancialEntryStatus.CANCELADO) {
            throw new BusinessException("Lançamento cancelado não pode ser pago");
        }
        entry.setStatus(FinancialEntryStatus.PAGO);
        entry.setPaidAt(Instant.now());
        return mapper.toResponse(financialEntryRepository.save(entry));
    }

    @Transactional
    public void delete(UUID id) {
        FinancialEntry entry = findOrThrow(id);
        if (entry.getStatus() == FinancialEntryStatus.PAGO) {
            throw new BusinessException("Lançamento já pago não pode ser excluído");
        }
        financialEntryRepository.delete(entry);
    }

    @Transactional
    public void createFromOrder(Order order) {
        if (financialEntryRepository.existsByOrderId(order.getId())) {
            return;
        }
        String displayName = order.getCustomer() != null
                ? order.getCustomer().getName()
                : order.getCustomerName();
        FinancialEntry entry = FinancialEntry.builder()
                .type(FinancialEntryType.RECEITA)
                .status(FinancialEntryStatus.PENDENTE)
                .description("Pedido " + order.getOrderNumber() + " - " + displayName)
                .amount(order.getTotalAmount())
                .dueDate(order.getDueDate())
                .order(order)
                .build();
        financialEntryRepository.save(entry);
    }

    @Transactional
    public void markAsPaidByOrderId(UUID orderId) {
        financialEntryRepository.findFirstByOrderId(orderId).ifPresent(entry -> {
            if (entry.getStatus() != FinancialEntryStatus.PAGO) {
                entry.setStatus(FinancialEntryStatus.PAGO);
                entry.setPaidAt(Instant.now());
                financialEntryRepository.save(entry);
            }
        });
    }

    @Transactional
    public void updateDueDateByOrderId(UUID orderId, LocalDate dueDate) {
        financialEntryRepository.findFirstByOrderId(orderId).ifPresent(entry -> {
            entry.setDueDate(dueDate);
            financialEntryRepository.save(entry);
        });
    }

    @Transactional
    public void updateAmountByOrderId(UUID orderId, java.math.BigDecimal amount) {
        financialEntryRepository.findFirstByOrderId(orderId).ifPresent(entry -> {
            if (entry.getStatus() == FinancialEntryStatus.PENDENTE) {
                entry.setAmount(amount);
                financialEntryRepository.save(entry);
            }
        });
    }

    private FinancialEntry findOrThrow(UUID id) {
        return financialEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento financeiro não encontrado"));
    }

    private Order resolveOrder(UUID orderId) {
        if (orderId == null) return null;
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado"));
    }

    private Specification<FinancialEntry> buildSpec(FinancialEntryType type, FinancialEntryStatus status,
                                                    LocalDate startDate, LocalDate endDate,
                                                    boolean overdueOnly) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null) predicates.add(cb.equal(root.get("type"), type));

            if (overdueOnly) {
                predicates.add(cb.equal(root.get("status"), FinancialEntryStatus.PENDENTE));
                predicates.add(cb.isNotNull(root.get("dueDate")));
                predicates.add(cb.lessThan(root.get("dueDate"), LocalDate.now()));
            } else if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (startDate != null) predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), startDate));
            if (endDate != null) predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), endDate));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
