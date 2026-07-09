package br.com.centralmax.maxhub.crm;

import br.com.centralmax.maxhub.crm.dto.CompleteScheduleRequest;
import br.com.centralmax.maxhub.crm.dto.ContactScheduleRequest;
import br.com.centralmax.maxhub.crm.dto.ContactScheduleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ContactScheduleController {

    private final ContactScheduleService service;

    @GetMapping("/api/customers/{customerId}/schedules")
    public ResponseEntity<List<ContactScheduleResponse>> getByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(service.getSchedulesByCustomer(customerId));
    }

    @PostMapping("/api/customers/{customerId}/schedules")
    public ResponseEntity<ContactScheduleResponse> create(
            @PathVariable UUID customerId,
            @Valid @RequestBody ContactScheduleRequest request) {
        return ResponseEntity.ok(service.createManualSchedule(customerId, request));
    }

    @PatchMapping("/api/schedules/{id}/complete")
    public ResponseEntity<ContactScheduleResponse> complete(
            @PathVariable UUID id,
            @RequestBody(required = false) CompleteScheduleRequest request) {
        return ResponseEntity.ok(service.completeSchedule(id, request));
    }

    @PatchMapping("/api/schedules/{id}/cancel")
    public ResponseEntity<ContactScheduleResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(service.cancelSchedule(id));
    }

    @GetMapping("/api/agenda/schedules")
    public ResponseEntity<List<ContactScheduleResponse>> getAgenda(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) UUID customerId) {
        return ResponseEntity.ok(service.getAgenda(period, customerId));
    }
}
