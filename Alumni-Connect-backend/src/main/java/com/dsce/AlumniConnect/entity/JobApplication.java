package com.dsce.AlumniConnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {
    @Id
    private String id;

    private String company;
    private String role;
    private String status; // Applied, Interview, Rejected
    private String date;

    @DBRef
    private User user;

    private String userId; // Store ID directly for easier querying
}
