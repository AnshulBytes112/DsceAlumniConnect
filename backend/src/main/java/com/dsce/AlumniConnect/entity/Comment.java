package com.dsce.AlumniConnect.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
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
    
    // Post reference - new DBRef pattern
    @DBRef(lazy = true)
    private Post post;
    
    // Post ID - indexed for fast queries on comments per post
    @Indexed
    private String postId;
    
    // Author reference - new DBRef pattern
    @DBRef(lazy = true)
    private User author;
    
    // Author ID - indexed for fast queries on comments by author
    @Indexed
    private String authorId;
    
    private String authorName; // Denormalized for display
    
    private String authorAvatar; // Denormalized for display
    
    private String authorRole; // Denormalized for display
    
    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment content cannot exceed 1000 characters")
    private String content;
    
    private LocalDateTime createdAt;
    
    private Integer likes = 0;
    
    private List<String> likedBy; // User IDs who liked this comment
    
    private Boolean isDeleted = false;
}
