package br.com.centralmax.maxhub.order;

public enum PaymentCondition {

    A_VISTA,
    NA_ENTREGA,
    TRINTA_DIAS,
    SESSENTA_DIAS,
    NOVENTA_DIAS;

    public String getLabel() {
        return switch (this) {
            case A_VISTA -> "À Vista";
            case NA_ENTREGA -> "Na Entrega";
            case TRINTA_DIAS -> "30 dias";
            case SESSENTA_DIAS -> "60 dias";
            case NOVENTA_DIAS -> "90 dias";
        };
    }
}
