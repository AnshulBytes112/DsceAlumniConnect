package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleSignUpRequest {
//    @NotBlank
//    @Email
//    private String email;

    @NotBlank
    private String idToken;
//
//    private String name;
//    private String profileImage;
}
