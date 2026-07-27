package com.dsce.AlumniConnect.DTO;

import com.dsce.AlumniConnect.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Integer graduationYear;
    private String department;
    private String usn;
    private String profilePicture;
    private String bio;
    private String linkedinProfile;
    private String contactNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String resumeUrl;
    private Boolean profileComplete;
    private String phone;
    private String location;
    private String website;
    
    private List<User.WorkExperience> workExperiences;
    private List<User.Education> educations;
    private List<User.Project> projects;
    private List<String> skills;
    private List<User.FeaturedSkill> featuredSkills;
    private List<User.Achievement> achievements;
    private String verificationStatus;
}
