package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnnouncementDTO {
    public AnnouncementDTO(String title2, String description2, String time2) {
        this.title = title2;
        this.description = description2;
        this.time = time2;
    }
    private Long id;
    private String title;
    private String description;
    private String time;
}
