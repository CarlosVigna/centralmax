package br.com.centralmax.maxhub.financial;

import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.financial.dto.FinancialEntryRequest;
import br.com.centralmax.maxhub.financial.dto.FinancialEntryResponse;
import br.com.centralmax.maxhub.financial.dto.FinancialSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/financial")
@RequiredArgsConstructor
public class FinancialEntryController {

    private final FinancialEntryService financialEntryService;

    @GetMapping
    public ResponseEntity<PageResponse<FinancialEntryResponse>> list(
            @RequestParam(required = false) FinancialEntryType type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(financialEntryService.list(type, status, startDate, endDate, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryResponse> summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(financialEntryService.getSummary(startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialEntryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(financialEntryService.getById(id));
    }

    @PostMapping
    public ResponseEntity<FinancialEntryResponse> create(@Valid @RequestBody FinancialEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financialEntryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialEntryResponse> update(@PathVariable UUID id,
            @Valid @RequestBody FinancialEntryRequest request) {
        return ResponseEntity.ok(financialEntryService.update(id, request));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<FinancialEntryResponse> pay(@PathVariable UUID id) {
        return ResponseEntity.ok(financialEntryService.pay(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        financialEntryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
