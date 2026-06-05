package com.fastgondulas.backend.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends ApiException {

    public BusinessException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
