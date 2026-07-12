package br.com.centralmax.maxhub.report.dto;

import java.util.List;

public record WeeklyForecastResponse(
        String period,
        List<ForecastItem> items
) {
    public record ForecastItem(
            String productId,
            String productName,
            String sku,
            double avgDailyQty,
            int forecastQty,
            int lastMonthQty,
            String trend
    ) {}
}
