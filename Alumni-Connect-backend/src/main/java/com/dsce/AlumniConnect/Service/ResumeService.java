package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.dsce.AlumniConnect.entity.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ResumeService {

    /**
     * Populate user fields from parsed resume data
     * Only fills in fields that are not already set or are empty
     */
    public void populateUserFromParsedResume(User user, ResumeParserResponse parsedResume) {
        ResumeParserResponse.ResumeProfile profile = parsedResume.getProfile();

        // Fill name if not provided or empty
        if ((user.getFirstName() == null || user.getFirstName().isEmpty()) &&
                profile.getName() != null && !profile.getName().isEmpty()) {
            String[] nameParts = profile.getName().split("\\s+", 2);
            user.setFirstName(nameParts[0]);
            if (nameParts.length > 1) {
                user.setLastName(nameParts[1]);
            }
        }

        // Fill email if not provided (shouldn't happen in signup, but just in case)
        if ((user.getEmail() == null || user.getEmail().isEmpty()) &&
                profile.getEmail() != null && !profile.getEmail().isEmpty()) {
            user.setEmail(profile.getEmail());
        }

        // Fill contact number if not provided
        if ((user.getContactNumber() == null || user.getContactNumber().isEmpty()) &&
                profile.getPhone() != null && !profile.getPhone().isEmpty()) {
            user.setContactNumber(profile.getPhone());
        }

        // Fill bio from summary
        if ((user.getBio() == null || user.getBio().isEmpty()) &&
                profile.getSummary() != null && !profile.getSummary().isEmpty()) {
            user.setBio(profile.getSummary());
        }

        // Fill location
        if (profile.getLocation() != null && !profile.getLocation().isEmpty()) {
            user.setLocation(profile.getLocation());
        }

        // Fill website/linkedin
        if (profile.getUrl() != null && !profile.getUrl().isEmpty()) {
            if (profile.getUrl().contains("linkedin.com")) {
                user.setLinkedinProfile(profile.getUrl());
            } else {
                user.setWebsite(profile.getUrl());
            }
        }

        // Convert and store work experiences
        if (parsedResume.getWorkExperiences() != null && !parsedResume.getWorkExperiences().isEmpty()) {
            List<User.WorkExperience> workExps = parsedResume.getWorkExperiences().stream()
                    .map(we -> new User.WorkExperience(
                            we.getCompany(),
                            we.getJobTitle(),
                            we.getDate(),
                            we.getDescriptions()))
                    .collect(Collectors.toList());
            user.setWorkExperiences(workExps);
        }

        // Convert and store educations
        if (parsedResume.getEducations() != null && !parsedResume.getEducations().isEmpty()) {
            List<User.Education> educations = parsedResume.getEducations().stream()
                    .map(ed -> new User.Education(
                            ed.getSchool(),
                            ed.getDegree(),
                            ed.getDate(),
                            ed.getGpa(),
                            ed.getDescriptions()))
                    .collect(Collectors.toList());
            user.setEducations(educations);
        }

        // Convert and store projects
        if (parsedResume.getProjects() != null && !parsedResume.getProjects().isEmpty()) {
            List<User.Project> projects = parsedResume.getProjects().stream()
                    .map(proj -> new User.Project(
                            proj.getProject(),
                            proj.getDate(),
                            proj.getDescriptions()))
                    .collect(Collectors.toList());
            user.setProjects(projects);
        }

        // Convert and store skills - clean and filter out empty/null values
        if (parsedResume.getSkills() != null) {
            List<String> allSkills = new ArrayList<>();

            // Store featured skills
            if (parsedResume.getSkills().getFeaturedSkills() != null) {
                List<User.FeaturedSkill> featuredSkills = parsedResume.getSkills().getFeaturedSkills().stream()
                        .filter(fs -> fs.getSkill() != null && !fs.getSkill().trim().isEmpty()
                                && !fs.getSkill().trim().equals(","))
                        .map(fs -> new User.FeaturedSkill(fs.getSkill().trim(),
                                fs.getRating() != null ? fs.getRating() : 1))
                        .collect(Collectors.toList());
                user.setFeaturedSkills(featuredSkills);

                // Also add to simple skills list
                List<String> featuredSkillNames = parsedResume.getSkills().getFeaturedSkills().stream()
                        .map(ResumeParserResponse.FeaturedSkill::getSkill)
                        .filter(skill -> skill != null && !skill.trim().isEmpty() && !skill.trim().equals(","))
                        .map(String::trim)
                        .collect(Collectors.toList());
                allSkills.addAll(featuredSkillNames);
            }

            // Add description skills if any - process comma-separated values
            if (parsedResume.getSkills().getDescriptions() != null &&
                    !parsedResume.getSkills().getDescriptions().isEmpty()) {
                List<String> descriptionSkills = parsedResume.getSkills().getDescriptions().stream()
                        .filter(desc -> desc != null && !desc.trim().isEmpty())
                        .flatMap(desc -> {
                            // Split by comma if it contains comma-separated values
                            if (desc.contains(",")) {
                                return Arrays.stream(desc.split(","))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty() && !s.equals(","))
                                        .collect(Collectors.toList())
                                        .stream();
                            }
                            // Otherwise, return the description as-is if it's meaningful
                            return Stream.of(desc.trim());
                        })
                        .filter(skill -> !skill.isEmpty() && !skill.equals(","))
                        .collect(Collectors.toList());
                allSkills.addAll(descriptionSkills);
            }

            // Remove duplicates and set skills
            if (!allSkills.isEmpty()) {
                List<String> uniqueSkills = allSkills.stream()
                        .distinct()
                        .filter(skill -> !skill.isEmpty() && !skill.equals(","))
                        .collect(Collectors.toList());
                user.setSkills(uniqueSkills);
            }
        }
    }
}
