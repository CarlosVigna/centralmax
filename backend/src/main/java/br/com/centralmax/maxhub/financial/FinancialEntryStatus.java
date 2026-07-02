package br.com.centralmax.maxhub.financial;

public enum FinancialEntryStatus {
    PENDENTE, PAGO, CANCELADO;

    public String getLabel() {
        return switch (this) {
            case PENDENTE -> "Pendente";
            case PAGO -> "Pago";
            case CANCELADO -> "Cancelado";
        };
    }
}
