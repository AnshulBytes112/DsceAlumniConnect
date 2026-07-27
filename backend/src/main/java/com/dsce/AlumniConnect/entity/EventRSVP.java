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

@Document(collection = "event_rsvps")
@CompoundIndexes({
    @CompoundIndex(name = "userId_status_idx", def = "{'userId': 1, 'status': 1}"),
    @CompoundIndex(name = "eventId_status_idx", def = "{'eventId': 1, 'status': 1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRSVP {
    @Id
    private String id;

    // User reference - new DBRef pattern
    @DBRef(lazy = true)
    private User user;
    
    // User ID - indexed for fast queries on user's RSVPs
    @Indexed
    private String userId;

    // Event reference - new DBRef pattern
    @DBRef(lazy = true)
    private Event event;
    
    // Event ID - indexed for fast queries on event's RSVPs
    @Indexed
    private String eventId;
    
    private RsvpStatus status;
    
    private LocalDateTime respondedAt;

    public enum RsvpStatus {
        GOING,
        MAYBE,
        NOT_GOING
    }
}
