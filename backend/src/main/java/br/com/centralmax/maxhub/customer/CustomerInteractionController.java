package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.customer.dto.CustomerInteractionRequest;
import br.com.centralmax.maxhub.customer.dto.CustomerInteractionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerInteractionController {

    private final CustomerInteractionService interactionService;

    @GetMapping("/agenda")
    public ResponseEntity<List<CustomerInteractionResponse>> agenda(
            @RequestParam(defaultValue = "today") String period) {
        return ResponseEntity.ok(interactionService.getAgenda(period));
    }

    @PostMapping("/{customerId}/interactions")
    public ResponseEntity<CustomerInteractionResponse> create(
            @PathVariable UUID customerId,
            @RequestBody @Valid CustomerInteractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interactionService.create(customerId, request));
    }

    @GetMapping("/{customerId}/interactions")
    public ResponseEntity<List<CustomerInteractionResponse>> list(@PathVariable UUID customerId) {
        return ResponseEntity.ok(interactionService.listByCustomer(customerId));
    }

    @DeleteMapping("/{customerId}/interactions/{interactionId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID customerId,
            @PathVariable UUID interactionId) {
        interactionService.delete(customerId, interactionId);
        return ResponseEntity.noContent().build();
    }
}
