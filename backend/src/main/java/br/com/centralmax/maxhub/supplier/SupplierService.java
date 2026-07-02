package br.com.centralmax.maxhub.supplier;

import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.supplier.dto.SupplierRequest;
import br.com.centralmax.maxhub.supplier.dto.SupplierResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Transactional(readOnly = true)
    public List<SupplierResponse> listActive() {
        return supplierRepository.findByActiveTrue().stream()
                .sorted(Comparator.comparing(Supplier::getName))
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> listAll() {
        return supplierRepository.findAll().stream()
                .sorted(Comparator.comparing(Supplier::getName))
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        supplier.setActive(true);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierResponse update(UUID id, SupplierRequest request) {
        Supplier supplier = findOrThrow(id);
        supplierMapper.updateEntity(request, supplier);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public void delete(UUID id) {
        Supplier supplier = findOrThrow(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    @Transactional
    public SupplierResponse activate(UUID id) {
        Supplier supplier = findOrThrow(id);
        supplier.setActive(true);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    private Supplier findOrThrow(UUID id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado"));
    }
}
