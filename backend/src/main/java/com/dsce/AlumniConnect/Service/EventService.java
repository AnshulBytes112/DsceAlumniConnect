package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.Repository.EventRSVPRepository;
import com.dsce.AlumniConnect.Repository.EventRepository;
import com.dsce.AlumniConnect.entity.Event;
import com.dsce.AlumniConnect.entity.EventRSVP;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

    @Cacheable(value = "allEvents")
    public List<EventDTO> getAllEventDTOs() {
        return eventRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getAllEventsWithUserStatus() {
        User currentUser = profileService.getCurrentUserProfile();
        List<EventDTO> cachedEvents = getAllEventDTOs();

        // Bulk fetch RSVPs to avoid N+1 queries
        List<EventRSVP> userRsvps = eventRSVPRepository.findByUserId(currentUser.getId());
        Map<String, String> rsvpMap = userRsvps.stream()
                .collect(Collectors.toMap(EventRSVP::getEventId, r -> r.getStatus().name(), (v1, v2) -> v1)); // merge function in case of dupes

        return cachedEvents.stream().map(cachedDto -> {
            EventDTO dto = new EventDTO(cachedDto);
            String status = rsvpMap.get(dto.getId());
            if (status != null) {
                dto.setUserRsvpStatus(status);
            }
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
                    try {
                        EventDTO cachedDto = getEventDTOById(rsvp.getEventId());
                        EventDTO dto = new EventDTO(cachedDto);
                        dto.setUserRsvpStatus(rsvp.getStatus().name());
                        return dto;
                    } catch (Exception e) {
                        log.warn("Event not found or cache error for RSVP event ID: {}", rsvp.getEventId());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        log.info("Returning {} events for user: {}", events.size(), currentUser.getId());
        return events;
    }

    @Cacheable(value = "featuredEvents")
    public List<EventDTO> getFeaturedEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream()
                .filter(Event::isFeatured)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = {"allEvents", "featuredEvents", "events", "dashboardStats"}, allEntries = true)
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
        event.setFeatured(eventDTO.isFeatured());
        event.setImageUrl(eventDTO.getImageUrl());

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

    @CacheEvict(value = {"dashboardStats"}, allEntries = true)
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

    @Cacheable(value = "events", key = "#eventId")
    public EventDTO getEventDTOById(String eventId) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            throw new RuntimeException("Event not found");
        }
        return mapToDTO(eventOpt.get());
    }

    public EventDTO getEventById(String eventId) {
        User currentUser = profileService.getCurrentUserProfile();
        EventDTO cachedDto = getEventDTOById(eventId);
        EventDTO dto = new EventDTO(cachedDto);

        Optional<EventRSVP> rsvp = eventRSVPRepository.findByUserIdAndEventId(currentUser.getId(), eventId);
        rsvp.ifPresent(r -> dto.setUserRsvpStatus(r.getStatus().name()));

        return dto;
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
        dto.setFeatured(event.isFeatured());
        dto.setImageUrl(event.getImageUrl());
        
        long registeredCount = eventRSVPRepository.countByEventIdAndStatus(event.getId(), EventRSVP.RsvpStatus.GOING);
        dto.setRegisteredCount((int) registeredCount);
        
        // Set engagement metrics
        dto.setLikes(event.getLikes());
        dto.setViews(event.getViews());
        dto.setComments(event.getComments());
        
        return dto;
    }
    
    @CacheEvict(value = {"events", "allEvents", "featuredEvents"}, allEntries = true)
    public void incrementViewCount(String eventId) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            event.setViews((event.getViews() != null ? event.getViews() : 0) + 1);
            eventRepository.save(event);
            log.info("Incremented view count for event: {}", eventId);
        }
    }
}
