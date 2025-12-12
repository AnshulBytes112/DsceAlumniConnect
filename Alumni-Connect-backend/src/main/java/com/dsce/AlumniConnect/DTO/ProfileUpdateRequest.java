package com.dsce.AlumniConnect.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    private String firstName;
    private String lastName;
    private String bio;
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
