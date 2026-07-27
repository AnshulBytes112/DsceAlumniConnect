package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GoogleSignUpRequest {
    @NotBlank(message = "Access token is required")
    @Size(min = 20, message = "Access token format is invalid")
    private String accessToken;
    //
    // private String name;
    // private String profileImage;
}
