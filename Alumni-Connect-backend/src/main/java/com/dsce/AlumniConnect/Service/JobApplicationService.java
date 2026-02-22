package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.JobApplicationDTO;
import com.dsce.AlumniConnect.Repository.JobApplicationRepository;
import com.dsce.AlumniConnect.Repository.JobPostRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.JobApplication;
import com.dsce.AlumniConnect.entity.JobPost;
import com.dsce.AlumniConnect.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    public JobApplicationDTO applyForJob(String jobId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        JobPost jobPost = jobPostRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if already applied
        List<JobApplication> existingApps = jobApplicationRepository.findByJobId(jobId);
        boolean alreadyApplied = existingApps.stream()
                .anyMatch(app -> app.getUserId() != null && app.getUserId().equals(user.getId()));
        if (alreadyApplied) {
            throw new RuntimeException("Already applied to this job");
        }

        JobApplication application = new JobApplication();
        application.setJobId(jobId);
        application.setUserId(user.getId());
        application.setUser(user);
        application.setCompany(jobPost.getCompany());
        application.setRole(jobPost.getTitle());
        application.setStatus("Applied");
        application.setDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));

        JobApplication saved = jobApplicationRepository.save(application);
        return convertToDTO(saved);
    }

    public List<JobApplicationDTO> getMyApplications() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        return jobApplicationRepository.findByUserId(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public JobApplicationDTO updateApplicationStatus(String applicationId, String status) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(status);
        JobApplication saved = jobApplicationRepository.save(application);
        return convertToDTO(saved);
    }

    public void withdrawApplication(String applicationId) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getUserId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized to withdraw this application");
        }

        jobApplicationRepository.deleteById(applicationId);
    }

    private JobApplicationDTO convertToDTO(JobApplication app) {
        return new JobApplicationDTO(
                app.getId(),
                app.getJobId(),
                app.getCompany(),
                app.getRole(),
                app.getStatus(),
                app.getDate());
    }
}
