package br.com.centralmax.maxhub.report;

import br.com.centralmax.maxhub.report.dto.CustomerReportResponse;
import br.com.centralmax.maxhub.report.dto.SalesReportResponse;
import br.com.centralmax.maxhub.report.dto.WeeklyForecastResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    public ResponseEntity<SalesReportResponse> sales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSalesReport(startDate, endDate));
    }

    @GetMapping("/customers")
    public ResponseEntity<CustomerReportResponse> customers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getCustomerReport(startDate, endDate));
    }

    @GetMapping("/weekly-forecast")
    public ResponseEntity<WeeklyForecastResponse> weeklyForecast() {
        return ResponseEntity.ok(reportService.getWeeklyForecast());
    }
}
