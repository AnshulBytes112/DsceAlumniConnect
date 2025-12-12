package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventDTO {
    private String id;
    private String day;
    private String month;
    private String title;
    private String starttime;
    private String endtime;
    private String time;
    private String description;
    private String category;
    private String maxParticipants;
    private String registrationDeadline;
    private String virtualLink;
    private String organizerName;
    private String organizerContact;
    private String location;
    private String userRsvpStatus; // GOING, MAYBE, NOT_GOING, or null
}
