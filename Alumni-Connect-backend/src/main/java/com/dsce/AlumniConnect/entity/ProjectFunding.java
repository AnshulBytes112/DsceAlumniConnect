package com.dsce.AlumniConnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "project_fundings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFunding {
    @Id
    private String id;

    private String title;
    private String amount;
    private String status; // Approved, Pending, In Review
    private String date;

    @DBRef
    private User user;

    private String userId; // Store ID directly for easier querying
}
