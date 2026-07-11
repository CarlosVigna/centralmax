package br.com.centralmax.maxhub.goals;

import br.com.centralmax.maxhub.goals.dto.SalesGoalRequest;
import br.com.centralmax.maxhub.goals.dto.SalesGoalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SalesGoalService {

    private final SalesGoalRepository salesGoalRepository;

    @Transactional(readOnly = true)
    public Optional<SalesGoalResponse> getGoalForMonth(LocalDate month) {
        return salesGoalRepository.findByMonth(month)
                .map(g -> new SalesGoalResponse(g.getId(), g.getMonth(), g.getTargetAmount(), g.getCreatedAt()));
    }

    @Transactional
    public SalesGoalResponse setGoal(SalesGoalRequest request) {
        SalesGoal goal = salesGoalRepository.findByMonth(request.month())
                .orElse(SalesGoal.builder().month(request.month()).build());
        goal.setTargetAmount(request.targetAmount());
        goal = salesGoalRepository.save(goal);
        return new SalesGoalResponse(goal.getId(), goal.getMonth(), goal.getTargetAmount(), goal.getCreatedAt());
    }
}
