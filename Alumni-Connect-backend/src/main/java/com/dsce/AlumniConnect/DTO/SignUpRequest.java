package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String confirmPassword;
    @NotNull(message = "Graduation year is required")
    private Integer graduationYear;

    @NotBlank
    private String department;
    @NotBlank
    private String contactNumber;

    private String profilePictureUrl;
    private String resumeUrl;
}
