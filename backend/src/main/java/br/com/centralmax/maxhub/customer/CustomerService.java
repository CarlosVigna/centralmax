package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.common.exception.DuplicateResourceException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> list(String search, CustomerStatus status, CustomerOrigin origin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Customer> result = customerRepository.findAll(buildSpec(search, status, origin), pageable);
        return PageResponse.from(result.map(customerMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(UUID id) {
        return customerMapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        validateEmailUniqueness(request.email(), null);

        Customer customer = Customer.builder()
                .name(request.name().trim())
                .email(normaliseEmail(request.email()))
                .phone(blankToNull(request.phone()))
                .document(blankToNull(request.document()))
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
                .build();

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request) {
        Customer customer = findOrThrow(id);
        validateEmailUniqueness(request.email(), id);

        customer.setName(request.name().trim());
        customer.setEmail(normaliseEmail(request.email()));
        customer.setPhone(blankToNull(request.phone()));
        customer.setDocument(blankToNull(request.document()));
        customer.setStatus(request.status() != null ? request.status() : customer.getStatus());
        customer.setNotes(blankToNull(request.notes()));
        customer.setAddressStreet(blankToNull(request.addressStreet()));
        customer.setAddressNumber(blankToNull(request.addressNumber()));
        customer.setAddressComplement(blankToNull(request.addressComplement()));
        customer.setAddressNeighborhood(blankToNull(request.addressNeighborhood()));
        customer.setAddressCity(blankToNull(request.addressCity()));
        customer.setAddressState(blankToNull(request.addressState()));
        customer.setAddressZip(blankToNull(request.addressZip()));
        // origin is immutable — never updated

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void delete(UUID id) {
        Customer customer = findOrThrow(id);
        customer.setActive(false);
        customerRepository.save(customer);
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

    private Specification<Customer> buildSpec(String search, CustomerStatus status, CustomerOrigin origin) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("active")));

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
