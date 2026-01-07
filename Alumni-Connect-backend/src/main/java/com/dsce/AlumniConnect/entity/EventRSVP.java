package com.dsce.AlumniConnect.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "event_rsvps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRSVP {
    @Id
    private String id;

    private String userId;
    private String eventId;
    private RsvpStatus status;

    public enum RsvpStatus {
        GOING,
        MAYBE,
        NOT_GOING
    }
}
