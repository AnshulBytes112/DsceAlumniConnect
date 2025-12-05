package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePicture;
    private String resumeUrl;
    private String jwtToken;
    private Boolean profileComplete;
}
