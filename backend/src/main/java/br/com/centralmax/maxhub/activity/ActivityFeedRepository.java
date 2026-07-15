package br.com.centralmax.maxhub.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ActivityFeedRepository extends JpaRepository<ActivityFeedEntry, UUID> {
    Page<ActivityFeedEntry> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
