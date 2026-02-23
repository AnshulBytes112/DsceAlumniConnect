package com.dsce.AlumniConnect.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {
    
    private String id;
    private String postId;
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;
    private String content;
    private LocalDateTime createdAt;
    private Integer likes;
    private Boolean isLiked;
    private Boolean isAuthor;
    private Boolean isDeleted;
}
