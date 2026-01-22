package com.dsce.AlumniConnect.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobPostDTO {
    private String id;
    private String title;
    private String company;
    private String location;
    private String type;
    private String description;
    private String requirements;
    private String contactEmail;
    private String applicationLink;
    private String postedByName; // For display purposes
    private String postedById;
    private LocalDateTime createdAt;
    private boolean active;
}
