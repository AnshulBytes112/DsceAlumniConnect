package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.dsce.AlumniConnect.entity.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ResumeService {

    public void populateUserFromParsedResume(User user, ResumeParserResponse parsedResume) {
        ResumeParserResponse.ResumeProfile profile = parsedResume.getProfile();

        if ((user.getFirstName() == null || user.getFirstName().isEmpty()) &&
                profile.getName() != null && !profile.getName().isEmpty()) {
            String[] nameParts = profile.getName().split("\\s+", 2);
            user.setFirstName(nameParts[0]);
            if (nameParts.length > 1) {
                user.setLastName(nameParts[1]);
            }
        }

        if ((user.getEmail() == null || user.getEmail().isEmpty()) &&
                profile.getEmail() != null && !profile.getEmail().isEmpty()) {
            user.setEmail(profile.getEmail());
        }

        if ((user.getContactNumber() == null || user.getContactNumber().isEmpty()) &&
                profile.getPhone() != null && !profile.getPhone().isEmpty()) {
            user.setContactNumber(profile.getPhone());
        }

        if ((user.getBio() == null || user.getBio().isEmpty()) &&
                profile.getSummary() != null && !profile.getSummary().isEmpty()) {
            user.setBio(profile.getSummary());
        }

        if (profile.getLocation() != null && !profile.getLocation().isEmpty()) {
            user.setLocation(profile.getLocation());
        }

        if (profile.getUrl() != null && !profile.getUrl().isEmpty()) {
            if (profile.getUrl().contains("linkedin.com")) {
                user.setLinkedinProfile(profile.getUrl());
            } else {
                user.setWebsite(profile.getUrl());
            }
        }

        // Process work experiences with cleanup
        List<User.WorkExperience> workExps = processWorkExperiences(parsedResume.getWorkExperiences());
        if (!workExps.isEmpty()) {
            user.setWorkExperiences(workExps);
        }

        // Process educations with merging
        List<User.Education> educations = processEducations(parsedResume.getEducations());
        if (!educations.isEmpty()) {
            user.setEducations(educations);
        }

        // Process projects with splitting
        List<User.Project> projects = processProjects(parsedResume.getProjects());
        
        // If no projects found, try to extract from work experience descriptions
        if (projects.isEmpty() && parsedResume.getWorkExperiences() != null) {
            projects = extractProjectsFromWorkExperiences(parsedResume.getWorkExperiences());
        }
        
        if (!projects.isEmpty()) {
            user.setProjects(projects);
        }

        // Process skills
        if (parsedResume.getSkills() != null) {
            List<String> allSkills = new ArrayList<>();

            if (parsedResume.getSkills().getFeaturedSkills() != null) {
                List<User.FeaturedSkill> featuredSkills = parsedResume.getSkills().getFeaturedSkills().stream()
                        .filter(fs -> fs.getSkill() != null && !fs.getSkill().trim().isEmpty()
                                && !fs.getSkill().trim().equals(","))
                        .map(fs -> new User.FeaturedSkill(fs.getSkill().trim(),
                                fs.getRating() != null ? fs.getRating() : 1))
                        .collect(Collectors.toList());
                user.setFeaturedSkills(featuredSkills);

                List<String> featuredSkillNames = parsedResume.getSkills().getFeaturedSkills().stream()
                        .map(ResumeParserResponse.FeaturedSkill::getSkill)
                        .filter(skill -> skill != null && !skill.trim().isEmpty() && !skill.trim().equals(","))
                        .map(String::trim)
                        .collect(Collectors.toList());
                allSkills.addAll(featuredSkillNames);
            }

            if (parsedResume.getSkills().getDescriptions() != null &&
                    !parsedResume.getSkills().getDescriptions().isEmpty()) {
                List<String> descriptionSkills = parsedResume.getSkills().getDescriptions().stream()
                        .filter(desc -> desc != null && !desc.trim().isEmpty())
                        .flatMap(desc -> {
                            if (desc.contains(",")) {
                                return Arrays.stream(desc.split(","))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty() && !s.equals(","))
                                        .collect(Collectors.toList())
                                        .stream();
                            }
                            return Stream.of(desc.trim());
                        })
                        .filter(skill -> !skill.isEmpty() && !skill.equals(","))
                        .collect(Collectors.toList());
                allSkills.addAll(descriptionSkills);
            }

            if (!allSkills.isEmpty()) {
                List<String> uniqueSkills = allSkills.stream()
                        .distinct()
                        .filter(skill -> !skill.isEmpty() && !skill.equals(","))
                        .collect(Collectors.toList());
                user.setSkills(uniqueSkills);
            }
        }
    }

    private List<User.WorkExperience> processWorkExperiences(List<ResumeParserResponse.ResumeWorkExperience> rawWorkExps) {
        if (rawWorkExps == null || rawWorkExps.isEmpty()) {
            return new ArrayList<>();
        }

        List<User.WorkExperience> cleaned = new ArrayList<>();

        for (ResumeParserResponse.ResumeWorkExperience we : rawWorkExps) {
            // Skip entries that look like descriptions (contain keywords like "Designing", "Contributing", etc.)
            if (isGarbageWorkExperience(we)) {
                continue;
            }

            User.WorkExperience exp = new User.WorkExperience();
            exp.setCompany(we.getCompany());
            exp.setJobTitle(we.getJobTitle());
            exp.setDate(we.getDate());
            exp.setMonth(we.getMonth());
            exp.setYear(we.getYear() != null ? Integer.parseInt(we.getYear()) : null);
            exp.setEndMonth(we.getEndMonth());
            exp.setEndYear(we.getEndYear() != null ? Integer.parseInt(we.getEndYear()) : null);
            exp.setCurrentlyWorking(we.getCurrentlyWorking());
            exp.setDescriptions(we.getDescriptions());

            cleaned.add(exp);
        }

        return cleaned;
    }

    private boolean isGarbageWorkExperience(ResumeParserResponse.ResumeWorkExperience we) {
        String company = we.getCompany() != null ? we.getCompany() : "";
        String jobTitle = we.getJobTitle() != null ? we.getJobTitle() : "";
        String date = we.getDate() != null ? we.getDate() : "";
        
        // Skip if company is empty
        if (company == null || company.trim().isEmpty()) {
            return true;
        }
        
        // Check for description-like company names (contains keywords that shouldn't be in company name)
        String lowerCompany = company.toLowerCase();
        if (lowerCompany.contains("designing") || lowerCompany.contains("contributing") || 
            lowerCompany.contains("built") || lowerCompany.contains("implemented") ||
            lowerCompany.contains("developed") || lowerCompany.contains("created") ||
            lowerCompany.contains("using") || lowerCompany.contains("and") ||
            lowerCompany.contains("architecture") || lowerCompany.contains("microservice") ||
            lowerCompany.contains("backend") || lowerCompany.contains("frontend") ||
            company.length() > 100) {
            return true;
        }
        
        // Check if company looks like a date range (e.g., "March 2025 - May 2025")
        if (company.matches(".*\\d{4}.*[-–].*\\d{4}.*") || 
            company.matches(".*(January|February|March|April|May|June|July|August|September|October|November|December).*\\d{4}.*")) {
            return true;
        }
        
        // Check if it's just a year range
        if (company.matches("\\d{4}\\s*[-–]\\s*\\d{4}\\s*")) {
            return true;
        }
        
        // Check for garbage job titles
        if (jobTitle.equals("–") || jobTitle.equals("-") || jobTitle.trim().isEmpty()) {
            // If job title is garbage but company is valid, that's okay - we'll use company as title
            return false;
        }
        
        // Check if job title contains tech keywords (which means it's not really a job title)
        if (jobTitle.toLowerCase().contains("terraform") || 
            jobTitle.toLowerCase().contains("kubernetes") ||
            jobTitle.toLowerCase().contains("aws") ||
            jobTitle.toLowerCase().contains("docker") ||
            jobTitle.toLowerCase().contains("golang") ||
            jobTitle.length() > 80) {
            // This is actually a description line, not a proper work experience
            return true;
        }
        
        return false;
    }

    private List<User.Education> processEducations(List<ResumeParserResponse.ResumeEducation> rawEducations) {
        if (rawEducations == null || rawEducations.isEmpty()) {
            return new ArrayList<>();
        }

        // Merge educations: combine entries with empty school but have degree or date
        List<ResumeParserResponse.ResumeEducation> merged = new ArrayList<>();
        ResumeParserResponse.ResumeEducation current = null;

        for (ResumeParserResponse.ResumeEducation edu : rawEducations) {
            boolean hasSchool = edu.getSchool() != null && !edu.getSchool().trim().isEmpty();
            boolean hasDegree = edu.getDegree() != null && !edu.getDegree().trim().isEmpty();
            boolean hasDate = edu.getDate() != null && !edu.getDate().trim().isEmpty();
            boolean hasYear = edu.getYear() != null;

            if (hasSchool) {
                // Save previous if exists and has meaningful data
                if (current != null && (current.getSchool() != null || current.getDegree() != null)) {
                    merged.add(current);
                }
                current = new ResumeParserResponse.ResumeEducation();
                current.setSchool(edu.getSchool());
                current.setDegree(edu.getDegree());
                current.setDate(edu.getDate());
                current.setGpa(edu.getGpa());
                current.setMonth(edu.getMonth());
                current.setYear(edu.getYear());
                current.setEndMonth(edu.getEndMonth());
                current.setEndYear(edu.getEndYear());
                current.setCurrentlyPursuing(edu.getCurrentlyPursuing());
                current.setDescriptions(edu.getDescriptions());
            } else if ((hasDegree || hasDate || hasYear) && current != null) {
                // Merge into current entry
                if (hasDegree && (current.getDegree() == null || current.getDegree().isEmpty())) {
                    current.setDegree(edu.getDegree());
                }
                if (hasDate && (current.getDate() == null || current.getDate().isEmpty())) {
                    current.setDate(edu.getDate());
                }
                if (hasYear && current.getYear() == null) {
                    current.setMonth(edu.getMonth());
                    current.setYear(edu.getYear());
                    current.setEndMonth(edu.getEndMonth());
                    current.setEndYear(edu.getEndYear());
                    current.setCurrentlyPursuing(edu.getCurrentlyPursuing());
                }
            }
        }
        
        if (current != null && (current.getSchool() != null || current.getDegree() != null)) {
            merged.add(current);
        }

        // Convert to User.Education
        return merged.stream()
                .filter(edu -> edu.getSchool() != null && !edu.getSchool().isEmpty())
                .map(edu -> new User.Education(
                        edu.getSchool(),
                        edu.getDegree(),
                        edu.getDate(),
                        edu.getGpa(),
                        edu.getMonth(),
                        edu.getYear() != null ? Integer.parseInt(edu.getYear()) : null,
                        edu.getEndMonth(),
                        edu.getEndYear() != null ? Integer.parseInt(edu.getEndYear()) : null,
                        edu.getCurrentlyPursuing(),
                        edu.getDescriptions()))
                .collect(Collectors.toList());
    }

    private List<User.Project> processProjects(List<ResumeParserResponse.ResumeProject> rawProjects) {
        if (rawProjects == null || rawProjects.isEmpty()) {
            return new ArrayList<>();
        }

        List<User.Project> cleaned = new ArrayList<>();

        for (ResumeParserResponse.ResumeProject proj : rawProjects) {
            String projectName = proj.getProject();
            List<String> descriptions = proj.getDescriptions();

            if (projectName == null || projectName.trim().isEmpty() || projectName.equals("–")) {
                continue;
            }

            // Split merged projects by common separators
            String[] projectNames = splitProjectNames(projectName);
            String[] allDescriptions = descriptions != null ? descriptions.toArray(new String[0]) : new String[0];

            int nameIndex = 0;
            for (String name : projectNames) {
                if (name.trim().isEmpty()) continue;

                User.Project p = new User.Project();
                p.setProject(name.trim());
                p.setDate(proj.getDate());

                // Try to assign descriptions
                List<String> assignedDescs = new ArrayList<>();
                if (allDescriptions.length > 0) {
                    // Simple heuristic: assign first few descriptions to first project, etc.
                    int descsPerProject = Math.max(1, allDescriptions.length / projectNames.length);
                    int start = nameIndex * descsPerProject;
                    int end = Math.min(start + descsPerProject, allDescriptions.length);
                    for (int i = start; i < end; i++) {
                        if (allDescriptions[i] != null && !allDescriptions[i].trim().isEmpty()) {
                            assignedDescs.add(allDescriptions[i]);
                        }
                    }
                }
                p.setDescriptions(assignedDescs);
                cleaned.add(p);
                nameIndex++;
            }
        }

        return cleaned;
    }

    private String[] splitProjectNames(String combined) {
        // Split by common separators like " – ", " | ", " GitHub", etc.
        if (combined == null || combined.isEmpty()) {
            return new String[]{};
        }

        // Try to split by " – " or " | " first
        if (combined.contains(" – ") || combined.contains(" | ")) {
            String[] parts = combined.split("\\s*–\\s*|\\s*\\|\\s*");
            return Arrays.stream(parts)
                    .filter(p -> !p.trim().isEmpty())
                    .toArray(String[]::new);
        }

        // If no separator, check for project patterns
        String[] projectIndicators = {"GitHub", "Git", "–"};
        for (String indicator : projectIndicators) {
            int idx = combined.lastIndexOf(indicator);
            if (idx > 30) { // Only split if indicator is not at the beginning
                List<String> result = new ArrayList<>();
                result.add(combined.substring(0, idx).trim());
                result.add(combined.substring(idx).trim());
                return result.toArray(new String[0]);
            }
        }

        return new String[]{combined};
    }
}
