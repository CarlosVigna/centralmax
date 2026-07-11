package br.com.centralmax.maxhub.goals;

import br.com.centralmax.maxhub.goals.dto.SalesGoalRequest;
import br.com.centralmax.maxhub.goals.dto.SalesGoalResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class SalesGoalController {

    private final SalesGoalService salesGoalService;

    @GetMapping
    public ResponseEntity<SalesGoalResponse> get(
            @RequestParam(required = false) String month) {
        LocalDate monthDate = month != null
                ? LocalDate.parse(month + "-01")
                : LocalDate.now().withDayOfMonth(1);
        Optional<SalesGoalResponse> goal = salesGoalService.getGoalForMonth(monthDate);
        return goal.map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<SalesGoalResponse> set(@Valid @RequestBody SalesGoalRequest request) {
        return ResponseEntity.ok(salesGoalService.setGoal(request));
    }
}
