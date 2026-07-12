package br.com.centralmax.maxhub.order.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrderTrackingResponse(
        String orderNumber,
        String customerName,
        String status,
        String statusLabel,
        LocalDate estimatedDeliveryDate,
        List<TrackingItem> items,
        List<TimelineEntry> timeline
) {
    public record TrackingItem(String productName, int quantity) {}
    public record TimelineEntry(String status, String label, Instant date) {}
}
