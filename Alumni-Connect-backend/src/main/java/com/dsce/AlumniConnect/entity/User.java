package com.dsce.AlumniConnect.entity;

import org.springframework.data.annotation.Id;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    @NotBlank
    private String firstName;

    private String lastName;

   @Indexed(unique = true)
   @NotBlank
    private String email;

   @NotBlank
    private String password;

    private Role role;  // USER or ADMIN

    private Integer graduationYear;
    private String department;
    private String profilePicture;
    private String bio;
    private String linkedinProfile;
    private String contactNumber;
    private AuthProvider authProvider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String resumeUrl;

    public User(String firstName, String lastName, String email, String password, Role role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    public User(String firstName, String lastName, String email, String password, Role role, AuthProvider authProvider) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role =role;
        this.authProvider = authProvider;
    }
    public enum AuthProvider {
        LOCAL,
        GOOGLE,
    }

    public enum Role {
        USER,
        ADMIN
    }


}
