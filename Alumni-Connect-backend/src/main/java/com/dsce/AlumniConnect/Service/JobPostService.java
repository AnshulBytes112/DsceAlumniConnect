package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.JobPostDTO;
import com.dsce.AlumniConnect.Repository.JobPostRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.JobPost;
import com.dsce.AlumniConnect.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostService {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    public JobPostDTO createJobPost(JobPostDTO jobPostDTO) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        JobPost jobPost = modelMapper.map(jobPostDTO, JobPost.class);
        jobPost.setPostedBy(user);
        jobPost.setPostedById(user.getId());
        jobPost.setCreatedAt(LocalDateTime.now());
        jobPost.setActive(true);

        JobPost savedJob = jobPostRepository.save(jobPost);
        return convertToDTO(savedJob);
    }

    public List<JobPostDTO> getAllActiveJobs() {
        return jobPostRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<JobPostDTO> getMyJobs() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        return jobPostRepository.findByPostedByIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteJobPost(String id) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        JobPost jobPost = jobPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));

        // Only allow owner or admin to delete
        if (!jobPost.getPostedById().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this job");
        }

        jobPostRepository.deleteById(id);
    }

    private JobPostDTO convertToDTO(JobPost jobPost) {
        JobPostDTO dto = new JobPostDTO();

        // Map basic fields
        dto.setId(jobPost.getId());
        dto.setTitle(jobPost.getTitle());
        dto.setCompany(jobPost.getCompany());
        dto.setLocation(jobPost.getLocation());
        dto.setType(jobPost.getType());
        dto.setDescription(jobPost.getDescription());
        dto.setRequirements(jobPost.getRequirements());
        dto.setContactEmail(jobPost.getContactEmail());
        dto.setApplicationLink(jobPost.getApplicationLink());
        dto.setActive(jobPost.isActive());
        dto.setCreatedAt(jobPost.getCreatedAt());

        // Map user-related fields
        if (jobPost.getPostedBy() != null) {
            dto.setPostedByName(jobPost.getPostedBy().getFirstName() + " " + jobPost.getPostedBy().getLastName());
            dto.setPostedById(jobPost.getPostedBy().getId());
        } else {
            dto.setPostedById(jobPost.getPostedById());
        }

        return dto;
    }
}
