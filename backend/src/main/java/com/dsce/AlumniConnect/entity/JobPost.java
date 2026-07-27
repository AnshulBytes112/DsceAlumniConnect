package com.dsce.AlumniConnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "job_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPost {
    @Id
    private String id;

    private String title;
    private String company;
    private String location;
    private String type; // e.g., Full-time, Part-time, Internship
    private String description;
    private String requirements;

    // Contact or Application info
    private String contactEmail;
    private String applicationLink;

    @DBRef(lazy = true)
    private User postedBy;
    
    // User ID - indexed for fast queries on user's job posts
    @Indexed
    private String postedById;

    @CreatedDate
    private LocalDateTime createdAt;

    // Indexed for finding active job listings
    @Indexed
    private boolean active = true;
}
