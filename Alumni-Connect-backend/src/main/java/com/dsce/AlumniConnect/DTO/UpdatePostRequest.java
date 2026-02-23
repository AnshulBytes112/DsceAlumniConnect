package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostRequest {
    
    @Size(max = 2000, message = "Post content cannot exceed 2000 characters")
    private String content;
    
    private List<String> media; // Base64 encoded images
    
    @Size(max = 10, message = "Maximum 10 hashtags allowed")
    private List<String> hashtags;
    
    @Size(max = 10, message = "Maximum 10 mentions allowed")
    private List<String> mentions;
}
