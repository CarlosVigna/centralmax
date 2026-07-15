package br.com.centralmax.maxhub.report.vendor;

import br.com.centralmax.maxhub.report.vendor.dto.VendorSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Year;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class VendorReportController {

    private final VendorReportService service;

    @GetMapping("/vendor-summary")
    public ResponseEntity<VendorSummaryResponse> vendorSummary(
            @RequestParam(defaultValue = "0") int year) {
        int y = year == 0 ? Year.now().getValue() : year;
        return ResponseEntity.ok(service.getSummary(y));
    }
}
