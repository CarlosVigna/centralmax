package br.com.centralmax.maxhub.product.dto;

import java.util.List;

public record ProductImportResult(
        int total,
        int created,
        int updated,
        List<LineError> errors
) {
    public record LineError(int line, String error) {}
}
