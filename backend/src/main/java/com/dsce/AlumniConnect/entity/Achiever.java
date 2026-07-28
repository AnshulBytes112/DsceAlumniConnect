package com.dsce.AlumniConnect.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "achievers")
public class Achiever {
    @Id
    private String id;
    
    private String name;
    private Integer graduationYear;
    private String headline;
    private String location;
    private String imageUrl;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
