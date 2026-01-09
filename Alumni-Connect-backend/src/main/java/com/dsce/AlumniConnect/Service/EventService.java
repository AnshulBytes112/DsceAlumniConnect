package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.Repository.EventRSVPRepository;
import com.dsce.AlumniConnect.Repository.EventRepository;
import com.dsce.AlumniConnect.entity.Event;
import com.dsce.AlumniConnect.entity.EventRSVP;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRSVPRepository eventRSVPRepository;
    private final ProfileService profileService;

    public List<EventDTO> getAllEventsWithUserStatus() {
        User currentUser = profileService.getCurrentUserProfile();
        List<Event> events = eventRepository.findAll();

        return events.stream().map(event -> {
            EventDTO dto = mapToDTO(event);
            // Check user status
            Optional<EventRSVP> rsvp = eventRSVPRepository.findByUserIdAndEventId(currentUser.getId(), event.getId());
            rsvp.ifPresent(r -> dto.setUserRsvpStatus(r.getStatus().name()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<EventDTO> getEventsUserIsAttending() {
        User currentUser = profileService.getCurrentUserProfile();
        log.info("Getting events user is attending for user: {}", currentUser.getId());
        
        List<EventRSVP> rsvps = eventRSVPRepository.findByUserIdAndStatus(currentUser.getId(),
                EventRSVP.RsvpStatus.GOING);
        
        log.info("Found {} RSVPs with GOING status for user: {}", rsvps.size(), currentUser.getId());

        List<EventDTO> events = rsvps.stream()
                .map(rsvp -> {
                    log.info("Processing RSVP for event: {} with status: {}", rsvp.getEventId(), rsvp.getStatus());
                    Optional<Event> eventOpt = eventRepository.findById(rsvp.getEventId());
                    if (eventOpt.isPresent()) {
                        Event event = eventOpt.get();
                        EventDTO dto = mapToDTO(event);
                        // Set RSVP status directly from the RSVP we already have
                        dto.setUserRsvpStatus(rsvp.getStatus().name());
                        log.info("Set RSVP status {} for event {}", rsvp.getStatus().name(), event.getId());
                        return dto;
                    } else {
                        log.warn("Event not found for RSVP event ID: {}", rsvp.getEventId());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        log.info("Returning {} events for user: {}", events.size(), currentUser.getId());
        return events;
    }

    public EventDTO createEvent(EventDTO eventDTO) {
        Event event = new Event();
        event.setTitle(eventDTO.getTitle());
        event.setDay(eventDTO.getDay());
        event.setMonth(eventDTO.getMonth());
        event.setStarttime(eventDTO.getStarttime());
        event.setEndtime(eventDTO.getEndtime());
        event.setTime(eventDTO.getTime());
        event.setDescription(eventDTO.getDescription());
        event.setCategory(eventDTO.getCategory());
        event.setMaxParticipants(eventDTO.getMaxParticipants());
        event.setRegistrationDeadline(eventDTO.getRegistrationDeadline());
        event.setVirtualLink(eventDTO.getVirtualLink());
        event.setOrganizerName(eventDTO.getOrganizerName());
        event.setOrganizerContact(eventDTO.getOrganizerContact());
        event.setLocation(eventDTO.getLocation());

        event.setEventDate(LocalDateTime.now()); // Simplified date handling
        
        // Set time field for frontend display
        if (eventDTO.getStarttime() != null && eventDTO.getEndtime() != null) {
            event.setTime(eventDTO.getStarttime() + " - " + eventDTO.getEndtime());
        } else if (eventDTO.getTime() != null) {
            event.setTime(eventDTO.getTime());
        }

        Event savedEvent = eventRepository.save(event);
        return mapToDTO(savedEvent);
    }

    public void rsvpEvent(String eventId, String status) {
        User currentUser = profileService.getCurrentUserProfile();
        EventRSVP.RsvpStatus rsvpStatus = EventRSVP.RsvpStatus.valueOf(status.toUpperCase());
        
        log.info("RSVP request - User: {}, Event: {}, Status: {}", currentUser.getId(), eventId, status);

        Optional<EventRSVP> existingRsvp = eventRSVPRepository.findByUserIdAndEventId(currentUser.getId(), eventId);

        EventRSVP rsvp;
        if (existingRsvp.isPresent()) {
            rsvp = existingRsvp.get();
            rsvp.setStatus(rsvpStatus);
            log.info("Updated existing RSVP for user: {}, event: {}", currentUser.getId(), eventId);
        } else {
            rsvp = new EventRSVP();
            rsvp.setUserId(currentUser.getId());
            rsvp.setEventId(eventId);
            rsvp.setStatus(rsvpStatus);
            log.info("Created new RSVP for user: {}, event: {}", currentUser.getId(), eventId);
        }

        EventRSVP savedRsvp = eventRSVPRepository.save(rsvp);
        log.info("Saved RSVP with ID: {}", savedRsvp.getId());
    }

    private EventDTO mapToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDay(event.getDay());
        dto.setMonth(event.getMonth());
        dto.setStarttime(event.getStarttime());
        dto.setEndtime(event.getEndtime());
        dto.setTime(event.getTime()); // Add this line
        dto.setDescription(event.getDescription());
        dto.setCategory(event.getCategory());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setVirtualLink(event.getVirtualLink());
        dto.setOrganizerName(event.getOrganizerName());
        dto.setOrganizerContact(event.getOrganizerContact());
        dto.setLocation(event.getLocation());
        return dto;
    }
}
