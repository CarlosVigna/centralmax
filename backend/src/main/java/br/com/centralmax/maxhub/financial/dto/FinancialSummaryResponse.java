package br.com.centralmax.maxhub.financial.dto;

import java.math.BigDecimal;

public record FinancialSummaryResponse(
        BigDecimal saldoMes,
        BigDecimal aReceber,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal vencidos,
        BigDecimal receitasPendentes,
        BigDecimal despesasPendentes
) {}
