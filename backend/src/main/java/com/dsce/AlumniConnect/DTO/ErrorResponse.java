package com.dsce.AlumniConnect.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private String message;
    private long timestamp;
    private Integer status;
    private String path;

    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public ErrorResponse(String message, Integer status, String path) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
        this.status = status;
        this.path = path;
    }
}