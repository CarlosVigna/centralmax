package br.com.centralmax.maxhub.saleschannel;

public enum ShippingResponsibility {

    CLIENT,
    SELLER,
    PLATFORM;

    public String getLabel() {
        return switch (this) {
            case CLIENT -> "Cliente";
            case SELLER -> "Vendedor";
            case PLATFORM -> "Plataforma";
        };
    }
}
