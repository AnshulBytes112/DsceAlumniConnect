package com.dsce.AlumniConnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    private String id;
    private String time;
    private String title;
    private String day;
    private String month;
    private String starttime;
    private String endtime;
    private String location;
    private String description;
    private String category;
    private String maxParticipants;
    private String registrationDeadline;
    private String virtualLink;
    private String organizerName;
    private String organizerContact;
    private String createDate;
    private String updateDate;
    private LocalDateTime eventDate;
}
