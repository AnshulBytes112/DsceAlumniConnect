package com.dsce.AlumniConnect.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    
    @Id
    private String id;
    
    @NotBlank(message = "Post ID is required")
    private String postId;
    
    @NotBlank(message = "Author ID is required")
    private String authorId;
    
    @NotBlank(message = "Author name is required")
    private String authorName;
    
    private String authorAvatar;
    
    private String authorRole;
    
    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment content cannot exceed 1000 characters")
    private String content;
    
    private LocalDateTime createdAt;
    
    private Integer likes = 0;
    
    private List<String> likedBy; // User IDs who liked this comment
    
    private Boolean isDeleted = false;
}
