package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.ProfileUpdateRequest;
import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ResumeParserService resumeParserService;

    // Get current user's profile
    public User getCurrentUserProfile() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Update user profile manually
    public User updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentUserProfile();

        // Update basic fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber());
        }
        if (request.getLinkedinProfile() != null) {
            user.setLinkedinProfile(request.getLinkedinProfile());
        }
        if (request.getWebsite() != null) {
            user.setWebsite(request.getWebsite());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getGraduationYear() != null) {
            user.setGraduationYear(request.getGraduationYear());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        // Update work experiences
        if (request.getWorkExperiences() != null) {
            List<User.WorkExperience> workExps = request.getWorkExperiences().stream()
                    .map(we -> new User.WorkExperience(
                            we.getCompany(),
                            we.getJobTitle(),
                            we.getDate(),
                            we.getDescriptions()))
                    .collect(Collectors.toList());
            user.setWorkExperiences(workExps);
        }

        // Update educations
        if (request.getEducations() != null) {
            List<User.Education> educations = request.getEducations().stream()
                    .map(ed -> new User.Education(
                            ed.getSchool(),
                            ed.getDegree(),
                            ed.getDate(),
                            ed.getGpa(),
                            ed.getDescriptions()))
                    .collect(Collectors.toList());
            user.setEducations(educations);
        }

        // Update projects
        if (request.getProjects() != null) {
            List<User.Project> projects = request.getProjects().stream()
                    .map(proj -> new User.Project(
                            proj.getProject(),
                            proj.getDate(),
                            proj.getDescriptions()))
                    .collect(Collectors.toList());
            user.setProjects(projects);
        }

        // Update skills
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getFeaturedSkills() != null) {
            List<User.FeaturedSkill> featuredSkills = request.getFeaturedSkills().stream()
                    .map(fs -> new User.FeaturedSkill(fs.getSkill(), fs.getRating()))
                    .collect(Collectors.toList());
            user.setFeaturedSkills(featuredSkills);
        }

        user.setUpdatedAt(LocalDateTime.now());
        markProfileAsCompleteIfReady(user);
        return userRepository.save(user);
    }

    // Update profile picture
    public User updateProfilePicture(MultipartFile profilePicture) throws IOException {
        User user = getCurrentUserProfile();

        if (profilePicture != null && !profilePicture.isEmpty()) {
            // Delete old profile picture if exists
            if (user.getProfilePicture() != null) {
                fileStorageService.deleteFile(user.getProfilePicture());
            }

            String profilePicturePath = fileStorageService.uploadProfilePicture(profilePicture);
            user.setProfilePicture(profilePicturePath);
            user.setUpdatedAt(LocalDateTime.now());
            markProfileAsCompleteIfReady(user);
            return userRepository.save(user);
        }

        throw new IllegalArgumentException("Profile picture is required");
    }

    // Upload and parse resume to update profile
    public User updateProfileFromResume(MultipartFile resume, boolean replaceExisting) throws IOException {
        User user = getCurrentUserProfile();

        if (resume == null || resume.isEmpty()) {
            throw new IllegalArgumentException("Resume file is required");
        }

        // Upload resume
        String resumePath = fileStorageService.uploadResume(resume);

        // Delete old resume if replacing
        if (replaceExisting && user.getResumeUrl() != null) {
            fileStorageService.deleteFile(user.getResumeUrl());
        }

        user.setResumeUrl(resumePath);

        // Parse resume and update profile
        parseAndUpdateProfile(user, resumePath, replaceExisting);

        user.setUpdatedAt(LocalDateTime.now());
        markProfileAsCompleteIfReady(user);
        return userRepository.save(user);
    }

    // Parse existing resume and update profile
    public User parseExistingResume(boolean replaceExisting) {
        User user = getCurrentUserProfile();

        if (user.getResumeUrl() == null || user.getResumeUrl().isEmpty()) {
            throw new IllegalArgumentException("No resume found. Please upload a resume first.");
        }

        // Parse existing resume and update profile
        parseAndUpdateProfile(user, user.getResumeUrl(), replaceExisting);

        user.setUpdatedAt(LocalDateTime.now());
        markProfileAsCompleteIfReady(user);
        return userRepository.save(user);
    }

    // Helper method to parse resume and update user profile
    private void parseAndUpdateProfile(User user, String resumePath, boolean replaceExisting) {
        try {
            String fullPath = fileStorageService.getFilePath(resumePath).toAbsolutePath().toString();
            ResumeParserResponse parsedResume = resumeParserService.parseResume(fullPath);

            log.info("Parsed resume data - Profile: {}, WorkExps: {}, Educations: {}, Projects: {}, Skills: {}",
                    parsedResume.getProfile() != null ? "present" : "null",
                    parsedResume.getWorkExperiences() != null ? parsedResume.getWorkExperiences().size() : 0,
                    parsedResume.getEducations() != null ? parsedResume.getEducations().size() : 0,
                    parsedResume.getProjects() != null ? parsedResume.getProjects().size() : 0,
                    parsedResume.getSkills() != null ? "present" : "null");

            // Update user data from parsed resume
            updateUserFromParsedResume(user, parsedResume, replaceExisting);

            log.info(
                    "Resume parsed and profile updated for user: {}. Updated fields - Contact: {}, Bio: {}, Location: {}, WorkExps: {}, Educations: {}, Projects: {}, Skills: {}",
                    user.getEmail(),
                    user.getContactNumber() != null ? "yes" : "no",
                    user.getBio() != null ? "yes" : "no",
                    user.getLocation() != null ? "yes" : "no",
                    user.getWorkExperiences() != null ? user.getWorkExperiences().size() : 0,
                    user.getEducations() != null ? user.getEducations().size() : 0,
                    user.getProjects() != null ? user.getProjects().size() : 0,
                    user.getSkills() != null ? user.getSkills().size() : 0);
        } catch (Exception e) {
            log.error("Failed to parse resume for user {}: {}", user.getEmail(), e.getMessage(), e);
            // Don't throw exception - allow user to continue even if parsing fails
        }
    }

    // Update user fields from parsed resume data
    private void updateUserFromParsedResume(User user, ResumeParserResponse parsedResume, boolean replaceExisting) {
        ResumeParserResponse.ResumeProfile profile = parsedResume.getProfile();

        // Update name
        if (replaceExisting || user.getFirstName() == null || user.getFirstName().isEmpty()) {
            if (profile.getName() != null && !profile.getName().isEmpty()) {
                String[] nameParts = profile.getName().split("\\s+", 2);
                user.setFirstName(nameParts[0]);
                if (nameParts.length > 1) {
                    user.setLastName(nameParts[1]);
                }
            }
        }

        // Update contact number
        if (replaceExisting || user.getContactNumber() == null || user.getContactNumber().isEmpty()) {
            if (profile.getPhone() != null && !profile.getPhone().isEmpty()) {
                user.setContactNumber(profile.getPhone());
            }
        }

        // Update bio from summary
        if (replaceExisting || user.getBio() == null || user.getBio().isEmpty()) {
            if (profile.getSummary() != null && !profile.getSummary().isEmpty()) {
                user.setBio(profile.getSummary());
            }
        }

        // Update location
        if (replaceExisting || user.getLocation() == null || user.getLocation().isEmpty()) {
            if (profile.getLocation() != null && !profile.getLocation().isEmpty()) {
                user.setLocation(profile.getLocation());
            }
        }

        // Update website/linkedin
        if (profile.getUrl() != null && !profile.getUrl().isEmpty()) {
            if (profile.getUrl().contains("linkedin.com")) {
                if (replaceExisting || user.getLinkedinProfile() == null || user.getLinkedinProfile().isEmpty()) {
                    user.setLinkedinProfile(profile.getUrl());
                }
            } else {
                if (replaceExisting || user.getWebsite() == null || user.getWebsite().isEmpty()) {
                    user.setWebsite(profile.getUrl());
                }
            }
        }

        // Update work experiences
        if (parsedResume.getWorkExperiences() != null && !parsedResume.getWorkExperiences().isEmpty()) {
            if (replaceExisting || user.getWorkExperiences() == null || user.getWorkExperiences().isEmpty()) {
                List<User.WorkExperience> workExps = parsedResume.getWorkExperiences().stream()
                        .map(we -> new User.WorkExperience(
                                we.getCompany(),
                                we.getJobTitle(),
                                we.getDate(),
                                we.getDescriptions()))
                        .collect(Collectors.toList());
                user.setWorkExperiences(workExps);
            }
        }

        // Update educations
        if (parsedResume.getEducations() != null && !parsedResume.getEducations().isEmpty()) {
            if (replaceExisting || user.getEducations() == null || user.getEducations().isEmpty()) {
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
        }

        // Update projects - flexible filling: only add projects that have at least name
        // or date
        if (parsedResume.getProjects() != null && !parsedResume.getProjects().isEmpty()) {
            if (replaceExisting || user.getProjects() == null || user.getProjects().isEmpty()) {
                List<User.Project> projects = parsedResume.getProjects().stream()
                        .filter(proj -> (proj.getProject() != null && !proj.getProject().trim().isEmpty()) ||
                                (proj.getDate() != null && !proj.getDate().trim().isEmpty())) // Only include projects
                                                                                              // with name or date
                        .map(proj -> new User.Project(
                                proj.getProject() != null ? proj.getProject() : "",
                                proj.getDate() != null ? proj.getDate() : "",
                                proj.getDescriptions() != null ? proj.getDescriptions() : new ArrayList<>()))
                        .collect(Collectors.toList());
                if (!projects.isEmpty()) {
                    user.setProjects(projects);
                }
            }
        }

        // Update skills - clean and filter out empty/null values
        if (parsedResume.getSkills() != null) {
            if (replaceExisting || user.getSkills() == null || user.getSkills().isEmpty()) {
                List<String> skills = new ArrayList<>();

                if (parsedResume.getSkills().getFeaturedSkills() != null) {
                    // Add featured skills, filtering out empty/null values
                    List<String> featuredSkillNames = parsedResume.getSkills().getFeaturedSkills().stream()
                            .map(ResumeParserResponse.FeaturedSkill::getSkill)
                            .filter(skill -> skill != null && !skill.trim().isEmpty() && !skill.trim().equals(","))
                            .map(String::trim)
                            .collect(Collectors.toList());
                    skills.addAll(featuredSkillNames);

                    // Set featured skills with ratings
                    List<User.FeaturedSkill> featuredSkills = parsedResume.getSkills().getFeaturedSkills().stream()
                            .filter(fs -> fs.getSkill() != null && !fs.getSkill().trim().isEmpty()
                                    && !fs.getSkill().trim().equals(","))
                            .map(fs -> new User.FeaturedSkill(fs.getSkill().trim(),
                                    fs.getRating() != null ? fs.getRating() : 1))
                            .collect(Collectors.toList());
                    user.setFeaturedSkills(featuredSkills);
                }

                if (parsedResume.getSkills().getDescriptions() != null) {
                    // Process descriptions - they might contain comma-separated skills or bullet
                    // points
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
                                // Otherwise, return the description as-is if it's a meaningful skill
                                return Stream.of(desc.trim());
                            })
                            .filter(skill -> !skill.isEmpty() && !skill.equals(","))
                            .distinct() // Remove duplicates
                            .collect(Collectors.toList());
                    skills.addAll(descriptionSkills);
                }

                // Remove duplicates and set skills
                List<String> uniqueSkills = skills.stream()
                        .distinct()
                        .filter(skill -> !skill.isEmpty() && !skill.equals(","))
                        .collect(Collectors.toList());
                user.setSkills(uniqueSkills);
            }
        }
    }

    // Mark profile as complete if essential fields are filled
    private void markProfileAsCompleteIfReady(User user) {
        boolean hasEssentialFields = user.getGraduationYear() != null &&
                user.getDepartment() != null &&
                user.getContactNumber() != null &&
                !user.getContactNumber().isEmpty();

        user.setProfileComplete(hasEssentialFields);
    }

    // Get current user's email
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }
}
