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

@Document(collection = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    private String id;

    // Author reference - new DBRef pattern
    @DBRef(lazy = true)
    private User author;

    // Author ID - indexed for fast queries on posts by author
    @Indexed
    private String authorId;

    private String authorName; // Denormalized for display

    private String authorAvatar; // Denormalized for display

    private String authorRole; // Denormalized for display

    private Integer graduationYear;

    private String department;

    @NotBlank(message = "Post content is required")
    @Size(max = 2000, message = "Post content cannot exceed 2000 characters")
    private String content;

    private LocalDateTime createdAt;

    private Integer likes = 0;

    private Integer comments = 0;

    private Integer shares = 0;

    private List<String> media; // Base64 encoded images

    @Size(max = 10, message = "Maximum 10 hashtags allowed")
    private List<String> hashtags;

    @Size(max = 10, message = "Maximum 10 mentions allowed")
    private List<String> mentions;

    private List<String> likedBy; // User IDs who liked this post

    private List<String> bookmarkedBy; // User IDs who bookmarked this post

    private List<String> reportedBy; // User IDs who reported this post

    // Child collection - comments on this post
    private List<String> commentIds; // Comment IDs for cascade delete when post deleted
}
