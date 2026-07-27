package com.dsce.AlumniConnect.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    @NotBlank(message = "Start time is required")
    private String starttime;
    @NotBlank(message = "End time is required")
    private String endtime;
    private String time;
    @NotBlank(message = "Event description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;
    @NotBlank(message = "Event category is required")
    private String category;
    @Min(value = 1, message = "Max participants must be at least 1")
    private Integer maxParticipants;
    private Integer registeredCount;
    private String registrationDeadline;
    private String virtualLink;
    @NotBlank(message = "Organizer name is required")
    private String organizerName;
    @NotBlank(message = "Organizer contact is required")
    private String organizerContact;
    @NotBlank(message = "Event location is required")
    private String location;
    private String userRsvpStatus; // GOING, MAYBE, NOT_GOING, or null
    private boolean featured; // Admin can feature events
    private String imageUrl; // Poster image for the event
    
    // Engagement metrics
    private Integer likes = 0;
    private Integer views = 0;
    private Integer comments = 0;
}
