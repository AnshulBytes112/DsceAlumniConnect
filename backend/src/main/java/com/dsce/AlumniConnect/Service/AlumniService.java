package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.UserProfileDTO;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AlumniService {
    @Autowired
    private UserRepository userRepository;

    @Cacheable(value = "allAlumni")
    public List<UserProfileDTO> getAllAlumni() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != User.Role.ADMIN )
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "alumni", key = "#id")
    public Optional<UserProfileDTO> getAlumniById(String id) {
        return userRepository.findById(id).map(this::mapToDTO);
    }
    
    private UserProfileDTO mapToDTO(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .graduationYear(user.getGraduationYear())
                .department(user.getDepartment())
                .usn(user.getUsn())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .linkedinProfile(user.getLinkedinProfile())
                .contactNumber(user.getContactNumber())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .resumeUrl(user.getResumeUrl())
                .profileComplete(user.getProfileComplete())
                .phone(user.getPhone())
                .location(user.getLocation())
                .website(user.getWebsite())
                .workExperiences(user.getWorkExperiences())
                .educations(user.getEducations())
                .projects(user.getProjects())
                .skills(user.getSkills())
                .featuredSkills(user.getFeaturedSkills())
                .achievements(user.getAchievements())
                .verificationStatus(user.getVerificationStatus() != null ? user.getVerificationStatus().name() : null)
                .build();
    }
}
