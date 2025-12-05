package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.Repository.EventRSVPRepository;
import com.dsce.AlumniConnect.Repository.EventRepository;
import com.dsce.AlumniConnect.entity.Event;
import com.dsce.AlumniConnect.entity.EventRSVP;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        List<EventRSVP> rsvps = eventRSVPRepository.findByUserIdAndStatus(currentUser.getId(),
                EventRSVP.RsvpStatus.GOING);

        return rsvps.stream()
                .map(rsvp -> eventRepository.findById(rsvp.getEventId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EventDTO createEvent(EventDTO eventDTO) {
        Event event = new Event();
        event.setTitle(eventDTO.getTitle());
        event.setDay(eventDTO.getDay());
        event.setMonth(eventDTO.getMonth());
        event.setTime(eventDTO.getTime());
        event.setLocation(eventDTO.getLocation());
        event.setEventDate(LocalDateTime.now()); // Simplified date handling

        Event savedEvent = eventRepository.save(event);
        return mapToDTO(savedEvent);
    }

    public void rsvpEvent(String eventId, String status) {
        User currentUser = profileService.getCurrentUserProfile();
        EventRSVP.RsvpStatus rsvpStatus = EventRSVP.RsvpStatus.valueOf(status.toUpperCase());

        Optional<EventRSVP> existingRsvp = eventRSVPRepository.findByUserIdAndEventId(currentUser.getId(), eventId);

        EventRSVP rsvp;
        if (existingRsvp.isPresent()) {
            rsvp = existingRsvp.get();
            rsvp.setStatus(rsvpStatus);
        } else {
            rsvp = new EventRSVP();
            rsvp.setUserId(currentUser.getId());
            rsvp.setEventId(eventId);
            rsvp.setStatus(rsvpStatus);
        }

        eventRSVPRepository.save(rsvp);
    }

    private EventDTO mapToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDay(event.getDay());
        dto.setMonth(event.getMonth());
        dto.setTime(event.getTime());
        dto.setLocation(event.getLocation());
        return dto;
    }
}
