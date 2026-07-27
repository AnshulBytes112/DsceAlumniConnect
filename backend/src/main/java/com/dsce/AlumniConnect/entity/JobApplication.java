package com.dsce.AlumniConnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "job_applications")
@CompoundIndexes({
    @CompoundIndex(name = "userId_status_idx", def = "{'userId': 1, 'status': 1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {
    @Id
    private String id;

    private String company;
    private String role;
    private String status; // Applied, Interview, Rejected
    private LocalDateTime appliedAt;

    // Applicant reference - new DBRef pattern
    @DBRef(lazy = true)
    private User applicant;
    
    // User ID - indexed for fast queries on user's applications
    @Indexed
    private String userId;

    // JobPost reference - new DBRef pattern
    @DBRef(lazy = true)
    private JobPost jobPost;
    
    // JobPost ID - indexed for finding applications per job
    @Indexed
    private String jobPostId;
}
