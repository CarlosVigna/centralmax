package br.com.centralmax.maxhub.common.response;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> fields
) {

    public record FieldError(String field, String message) {
    }
}
