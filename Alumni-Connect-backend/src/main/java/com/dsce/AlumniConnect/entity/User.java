package com.dsce.AlumniConnect.entity;

import org.springframework.data.annotation.Id;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

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

    private Role role; // USER or ADMIN

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
    private Boolean profileComplete = false;
    private String phone;
    private String location;
    private String website;
    private List<WorkExperience> workExperiences;
    private List<Education> educations;
    private List<Project> projects;
    private List<String> skills;
    private List<FeaturedSkill> featuredSkills;
    private List<Achievement> achievements;
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperience {
        private String company;
        private String jobTitle;
        private String date;
        private List<String> descriptions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Education {
        private String school;
        private String degree;
        private String date;
        private String gpa;
        private List<String> descriptions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Project {
        private String project;
        private String date;
        private List<String> descriptions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturedSkill {
        private String skill;
        private Integer rating;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Achievement {
        private String Title;
        private String Description;
        private String Date;
    }

    public User(String firstName, String lastName, String email, String password, Role role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public User(String firstName, String lastName, String email, String password, Role role,
            AuthProvider authProvider) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
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
