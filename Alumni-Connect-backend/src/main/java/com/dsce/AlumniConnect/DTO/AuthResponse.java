package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String Firstname;
    private String Lastname;
    private String email;
    private String profilePicture;
    private String ResumeUrl;
    private String jwtToken;
}
