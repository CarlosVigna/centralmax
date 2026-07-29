package br.com.centralmax.maxhub.report.dto;

import java.math.BigDecimal;
import java.util.List;

public record ChannelProfitabilityResponse(
        String period,
        List<ChannelProfitability> channels,
        Totals totals
) {

    public record ChannelProfitability(
            String channelName,
            long totalOrders,
            BigDecimal grossRevenue,
            BigDecimal totalFees,
            BigDecimal vendorCommissions,
            BigDecimal netProfit,
            BigDecimal profitMargin,
            BigDecimal avgOrderValue
    ) {}

    public record Totals(
            long totalOrders,
            BigDecimal grossRevenue,
            BigDecimal totalFees,
            BigDecimal vendorCommissions,
            BigDecimal netProfit,
            BigDecimal profitMargin
    ) {}
}
