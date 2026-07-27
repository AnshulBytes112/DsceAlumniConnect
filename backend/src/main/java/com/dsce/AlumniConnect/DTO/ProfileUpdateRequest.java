package com.dsce.AlumniConnect.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Ignore unknown fields like "resume", "profilePicture" that are sent
                                            // separately
public class ProfileUpdateRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;
    
    @Pattern(regexp = "^[0-9\\s\\-\\+\\(\\)]*$", message = "Contact number format is invalid")
    private String contactNumber;
    
    private String linkedinProfile;
    private String website;
    private String location;
    private Integer graduationYear;
    private String department;
    private List<WorkExperienceDto> workExperiences;
    private List<EducationDto> educations;
    private List<ProjectDto> projects;
    private List<String> skills;
    private List<FeaturedSkillDto> featuredSkills;
    private List<AchievementDto> achievements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperienceDto {
        private String company;
        private String jobTitle;
        private String date;
        private String month;
        private Integer year;
        private String endMonth;
        private Integer endYear;
        private Boolean currentlyWorking;
        private List<String> descriptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationDto {
        private String school;
        private String degree;
        private String date;
        private String gpa;
        private String month;
        private Integer year;
        private String endMonth;
        private Integer endYear;
        private Boolean currentlyPursuing;
        private List<String> descriptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDto {
        private String project;
        private String date;
        private List<String> descriptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturedSkillDto {
        private String skill;
        private Integer rating;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementDto {
        private String Title;
        private String Description;
        private String Date;
    }
}
