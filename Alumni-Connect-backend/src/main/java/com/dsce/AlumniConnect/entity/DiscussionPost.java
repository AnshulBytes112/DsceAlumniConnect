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

@Document(collection = "discussion_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionPost {
    
    @Id
    private String id;
    
    @NotBlank(message = "Topic ID is required")
    private String topicId;
    
    @NotBlank(message = "Group ID is required")
    private String groupId;
    
    @NotBlank(message = "Author ID is required")
    private String authorId;
    
    private String authorName;
    
    private String authorAvatar;
    
    private String authorRole;
    
    @NotBlank(message = "Post content is required")
    @Size(max = 3000, message = "Content cannot exceed 3000 characters")
    private String content;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Integer likeCount = 0;
    
    private List<String> likedBy;
    
    private Boolean isDeleted = false;
    
    private String parentPostId; // For nested replies (optional)
    
    private List<String> mentions; // @username mentions
}
