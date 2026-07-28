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
@Document(collection = "gallery_images")
public class GalleryImage {
    @Id
    private String id;
    
    private String url;
    private String caption;
    private String category; // e.g. 'campus', 'events'
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
