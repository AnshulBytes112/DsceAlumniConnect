package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogInRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;
}
