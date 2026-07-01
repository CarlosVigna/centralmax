package br.com.centralmax.maxhub.supplier;

import br.com.centralmax.maxhub.supplier.dto.SupplierResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<SupplierResponse> listActive() {
        return supplierRepository.findByActiveTrue().stream()
                .map(s -> new SupplierResponse(s.getId(), s.getName(), s.getDocument(), s.getPhone(), s.getEmail()))
                .toList();
    }
}
