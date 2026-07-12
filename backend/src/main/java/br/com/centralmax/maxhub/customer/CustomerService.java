package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.common.exception.DuplicateResourceException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.crm.ContactScheduleService;
import br.com.centralmax.maxhub.customer.dto.CustomerRequest;
import br.com.centralmax.maxhub.customer.dto.CustomerResponse;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final ContactScheduleService contactScheduleService;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> list(String search, CustomerStatus status, CustomerOrigin origin, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Customer> result = customerRepository.findAll(buildSpec(search, status, origin, active), pageable);
        return PageResponse.from(result.map(customerMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(UUID id) {
        Customer customer = findOrThrow(id);
        List<String> favorites = customerRepository.findFavoriteProducts(id);
        Object[] overdueData = customerRepository.findOverdueData(id);
        BigDecimal overdueAmount = BigDecimal.ZERO;
        int overdueCount = 0;
        if (overdueData != null && overdueData.length >= 2) {
            overdueAmount = overdueData[0] != null ? new BigDecimal(overdueData[0].toString()) : BigDecimal.ZERO;
            overdueCount = overdueData[1] != null ? ((Number) overdueData[1]).intValue() : 0;
        }
        return customerMapper.toResponseWithFavorites(customer, favorites, overdueAmount, overdueCount);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> listReactivate() {
        LocalDate cutoff = LocalDate.now().minusDays(90);
        return customerRepository.findCustomersToReactivate(CustomerStatus.ATIVO, cutoff)
                .stream().map(customerMapper::toResponse).toList();
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        validateEmailUniqueness(request.email(), null);

        Customer customer = Customer.builder()
                .name(request.name().trim())
                .email(normaliseEmail(request.email()))
                .phone(blankToNull(request.phone()))
                .document(blankToNull(request.document()))
                .documentType(request.documentType() != null ? request.documentType() : "CNPJ")
                .status(request.status() != null ? request.status() : CustomerStatus.PROSPECT)
                .origin(request.origin())
                .notes(blankToNull(request.notes()))
                .addressStreet(blankToNull(request.addressStreet()))
                .addressNumber(blankToNull(request.addressNumber()))
                .addressComplement(blankToNull(request.addressComplement()))
                .addressNeighborhood(blankToNull(request.addressNeighborhood()))
                .addressCity(blankToNull(request.addressCity()))
                .addressState(blankToNull(request.addressState()))
                .addressZip(blankToNull(request.addressZip()))
                .contactCadenceDays(request.contactCadenceDays())
                .nextContactDate(request.nextContactDate())
                .commercialPotential(request.commercialPotential())
                .commercialNotes(blankToNull(request.commercialNotes()))
                .businessType(blankToNull(request.businessType()))
                .prospectStatus(request.prospectStatus())
                .lostReason(blankToNull(request.lostReason()))
                .build();

        Customer saved = customerRepository.save(customer);
        if (saved.getContactCadenceDays() != null) {
            contactScheduleService.generateNextSchedule(saved);
        } else if (saved.getNextContactDate() != null) {
            contactScheduleService.createManualSchedule(saved.getId(),
                    new br.com.centralmax.maxhub.crm.dto.ContactScheduleRequest(
                            saved.getNextContactDate(),
                            blankToNull(request.cadenceReason()) != null ? request.cadenceReason() : "Contato agendado"));
        }
        return customerMapper.toResponse(saved);
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request) {
        Customer customer = findOrThrow(id);
        validateEmailUniqueness(request.email(), id);

        Integer oldCadence = customer.getContactCadenceDays();

        customer.setName(request.name().trim());
        customer.setEmail(normaliseEmail(request.email()));
        customer.setPhone(blankToNull(request.phone()));
        customer.setDocument(blankToNull(request.document()));
        if (request.documentType() != null) customer.setDocumentType(request.documentType());
        customer.setStatus(request.status() != null ? request.status() : customer.getStatus());
        customer.setNotes(blankToNull(request.notes()));
        customer.setAddressStreet(blankToNull(request.addressStreet()));
        customer.setAddressNumber(blankToNull(request.addressNumber()));
        customer.setAddressComplement(blankToNull(request.addressComplement()));
        customer.setAddressNeighborhood(blankToNull(request.addressNeighborhood()));
        customer.setAddressCity(blankToNull(request.addressCity()));
        customer.setAddressState(blankToNull(request.addressState()));
        customer.setAddressZip(blankToNull(request.addressZip()));
        customer.setContactCadenceDays(request.contactCadenceDays());
        if (request.nextContactDate() != null) {
            customer.setNextContactDate(request.nextContactDate());
        }
        customer.setCommercialPotential(request.commercialPotential());
        customer.setCommercialNotes(blankToNull(request.commercialNotes()));
        customer.setBusinessType(blankToNull(request.businessType()));
        customer.setProspectStatus(request.prospectStatus());
        customer.setLostReason(blankToNull(request.lostReason()));
        // origin is immutable — never updated

        Customer saved = customerRepository.save(customer);

        boolean cadenceChanged = request.contactCadenceDays() != null
                && !request.contactCadenceDays().equals(oldCadence);
        if (cadenceChanged) {
            contactScheduleService.generateNextSchedule(saved);
        }
        return customerMapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Customer customer = findOrThrow(id);
        customer.setActive(false);
        customerRepository.save(customer);
    }

    @Transactional
    public void updateCustomerStats(UUID customerId) {
        customerRepository.findById(customerId).ifPresent(customer -> {
            Object[] stats = customerRepository.findCustomerStats(customerId);
            if (stats != null && stats.length >= 3) {
                customer.setAverageTicket(stats[0] != null ? new BigDecimal(stats[0].toString()) : BigDecimal.ZERO);
                customer.setTotalPurchased(stats[1] != null ? new BigDecimal(stats[1].toString()) : BigDecimal.ZERO);
                if (stats[2] != null) {
                    customer.setLastPurchaseDate(LocalDate.parse(stats[2].toString()));
                }
            }
            customerRepository.save(customer);
        });
    }

    private Customer findOrThrow(UUID id) {
        return customerRepository.findById(id)
                .filter(Customer::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
    }

    private void validateEmailUniqueness(String email, UUID excludeId) {
        if (email == null || email.isBlank()) return;
        String normalised = email.trim().toLowerCase();
        boolean exists = excludeId == null
                ? customerRepository.existsByEmail(normalised)
                : customerRepository.existsByEmailAndIdNot(normalised, excludeId);
        if (exists) throw new DuplicateResourceException("E-mail já cadastrado");
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private String normaliseEmail(String email) {
        return (email == null || email.isBlank()) ? null : email.trim().toLowerCase();
    }

    private Specification<Customer> buildSpec(String search, CustomerStatus status, CustomerOrigin origin, Boolean active) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (active != null) {
                predicates.add(active ? cb.isTrue(root.get("active")) : cb.isFalse(root.get("active")));
            } else {
                predicates.add(cb.isTrue(root.get("active")));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (origin != null) {
                predicates.add(cb.equal(root.get("origin"), origin));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
