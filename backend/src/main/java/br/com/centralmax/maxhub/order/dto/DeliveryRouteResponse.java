package br.com.centralmax.maxhub.order.dto;

import java.time.LocalDate;
import java.util.List;

public record DeliveryRouteResponse(
        LocalDate date,
        List<DeliveryRouteStop> stops,
        String googleMapsUrl
) {}
