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

@Document(collection = "discussion_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionTopic {
    
    @Id
    private String id;
    
    @NotBlank(message = "Group ID is required")
    private String groupId;
    
    private String groupName;
    
    @NotBlank(message = "Topic title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;
    
    @Size(max = 2000, message = "Content cannot exceed 2000 characters")
    private String content;
    
    @NotBlank(message = "Author ID is required")
    private String authorId;
    
    private String authorName;
    
    private String authorAvatar;
    
    private String authorRole;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Integer viewCount = 0;
    
    private Integer replyCount = 0;
    
    private Integer likeCount = 0;
    
    private List<String> likedBy;
    
    private Boolean isPinned = false;
    
    private Boolean isLocked = false;
    
    private Boolean isDeleted = false;
    
    private List<String> tags;
    
    private String lastReplyId;
    
    private LocalDateTime lastReplyAt;
    
    private String lastReplyBy;
    
    private String lastReplyByName;
}
