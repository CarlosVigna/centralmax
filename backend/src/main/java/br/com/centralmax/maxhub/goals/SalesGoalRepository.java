package br.com.centralmax.maxhub.goals;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface SalesGoalRepository extends JpaRepository<SalesGoal, UUID> {
    Optional<SalesGoal> findByMonth(LocalDate month);
}
