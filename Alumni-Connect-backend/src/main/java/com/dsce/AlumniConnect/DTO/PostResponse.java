package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    
    private String id;
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;
    private Integer graduationYear;
    private String department;
    private String content;
    private LocalDateTime createdAt;
    private Integer likes;
    private Integer comments;
    private Integer shares;
    private List<String> media;
    private List<String> hashtags;
    private List<String> mentions;
    private Boolean isLiked;
    private Boolean isAuthor;
    private Boolean isBookmarked;

    public void setLikedBy(ArrayList<Object> objects) {

    }

    public void setReportedBy(ArrayList<Object> objects) {
    }
}
