package br.com.centralmax.maxhub.saleschannel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SalesChannelRepository extends JpaRepository<SalesChannel, UUID> {

    List<SalesChannel> findByActiveTrueOrderByNameAsc();

    List<SalesChannel> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
