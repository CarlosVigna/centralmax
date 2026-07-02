package br.com.centralmax.maxhub.financial;

public enum FinancialEntryType {
    RECEITA, DESPESA;

    public String getLabel() {
        return switch (this) {
            case RECEITA -> "Receita";
            case DESPESA -> "Despesa";
        };
    }
}
