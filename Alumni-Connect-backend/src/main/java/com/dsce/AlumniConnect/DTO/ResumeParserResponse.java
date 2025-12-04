package com.dsce.AlumniConnect.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Ignore unknown fields like "custom" from parser
public class ResumeParserResponse {
    private ResumeProfile profile;
    private List<ResumeWorkExperience> workExperiences;
    private List<ResumeEducation> educations;
    private List<ResumeProject> projects;
    private ResumeSkills skills;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeProfile {
        private String name;
        private String email;
        private String phone;
        private String url;
        private String summary;
        private String location;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeWorkExperience {
        private String company;
        private String jobTitle;
        private String date;
        private List<String> descriptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeEducation {
        private String school;
        private String degree;
        private String date;
        private String gpa;
        private List<String> descriptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeProject {
        private String project;
        private String date;
        private List<String> descriptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturedSkill {
        private String skill;
        private Integer rating;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeSkills {
        private List<FeaturedSkill> featuredSkills;
        private List<String> descriptions;
    }
}
