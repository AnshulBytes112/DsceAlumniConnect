package com.dsce.AlumniConnect.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "discussion_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionGroup {
    
    @Id
    private String id;
    
    @NotBlank(message = "Group name is required")
    @Size(max = 100, message = "Group name cannot exceed 100 characters")
    @Indexed(unique = true)
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @NotBlank(message = "Creator ID is required")
    private String createdBy;
    
    private String createdByName;
    
    private String category; // e.g., "Career", "Technology", "General", "Department"
    
    private List<String> tags;
    
    private String icon; // Icon name or URL
    
    private String color; // Theme color for the group
    
    private Boolean isPrivate = false;
    
    private List<String> members; // User IDs who joined the group
    
    private List<String> moderators; // User IDs who can moderate
    
    private Integer topicCount = 0;
    
    private Integer postCount = 0;
    
    private Integer memberCount = 1; // Creator is first member
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private String lastTopicId;
    
    private String lastTopicTitle;
    
    private LocalDateTime lastPostAt;
    
    private String lastPostBy;
    
    private String lastPostByName;
    
    private Boolean isActive = true;
}
