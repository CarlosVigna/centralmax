package br.com.centralmax.maxhub.saleschannel;

public enum FeeBase {

    TOTAL,
    PRODUCTS;

    public String getLabel() {
        return switch (this) {
            case TOTAL -> "Valor total do pedido";
            case PRODUCTS -> "Apenas produtos (sem frete)";
        };
    }
}
