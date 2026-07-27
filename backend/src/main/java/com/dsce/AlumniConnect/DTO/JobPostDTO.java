package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobPostDTO {
    private String id;
    
    @NotBlank(message = "Job title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String company;
    
    @NotBlank(message = "Job location is required")
    private String location;
    
    @NotBlank(message = "Job type is required")
    private String type;
    
    @NotBlank(message = "Job description is required")
    @Size(min = 10, max = 3000, message = "Description must be between 10 and 3000 characters")
    private String description;
    
    @Size(max = 2000, message = "Requirements cannot exceed 2000 characters")
    private String requirements;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be valid")
    private String contactEmail;
    
    private String applicationLink;
    private String postedByName; // For display purposes
    private String postedById;
    private LocalDateTime createdAt;
    private boolean active;
}
