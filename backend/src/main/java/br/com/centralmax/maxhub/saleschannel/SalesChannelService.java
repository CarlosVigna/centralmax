package br.com.centralmax.maxhub.saleschannel;

import br.com.centralmax.maxhub.common.exception.DuplicateResourceException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.saleschannel.dto.SalesChannelRequest;
import br.com.centralmax.maxhub.saleschannel.dto.SalesChannelResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesChannelService {

    private final SalesChannelRepository salesChannelRepository;
    private final SalesChannelMapper salesChannelMapper;

    @Transactional(readOnly = true)
    public List<SalesChannelResponse> listActive() {
        return salesChannelRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(salesChannelMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SalesChannelResponse> listAll() {
        return salesChannelRepository.findAllByOrderByNameAsc().stream()
                .map(salesChannelMapper::toResponse)
                .toList();
    }

    @Transactional
    public SalesChannelResponse create(SalesChannelRequest request) {
        if (salesChannelRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Já existe um canal de venda com esse nome");
        }

        SalesChannel channel = SalesChannel.builder()
                .name(request.name().trim())
                .fixedFee(request.fixedFee())
                .variableFeePercent(request.variableFeePercent())
                .feeBase(request.feeBase())
                .shippingResponsibility(request.shippingResponsibility() != null
                        ? request.shippingResponsibility() : ShippingResponsibility.CLIENT)
                .notes(blankToNull(request.notes()))
                .build();

        return salesChannelMapper.toResponse(salesChannelRepository.save(channel));
    }

    @Transactional
    public SalesChannelResponse update(UUID id, SalesChannelRequest request) {
        SalesChannel channel = findOrThrow(id);

        if (salesChannelRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new DuplicateResourceException("Já existe um canal de venda com esse nome");
        }

        channel.setName(request.name().trim());
        channel.setFixedFee(request.fixedFee());
        channel.setVariableFeePercent(request.variableFeePercent());
        channel.setFeeBase(request.feeBase());
        channel.setShippingResponsibility(request.shippingResponsibility() != null
                ? request.shippingResponsibility() : ShippingResponsibility.CLIENT);
        channel.setNotes(blankToNull(request.notes()));

        return salesChannelMapper.toResponse(salesChannelRepository.save(channel));
    }

    @Transactional
    public void softDelete(UUID id) {
        SalesChannel channel = findOrThrow(id);
        channel.setActive(false);
        salesChannelRepository.save(channel);
    }

    private SalesChannel findOrThrow(UUID id) {
        return salesChannelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Canal de venda não encontrado"));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
