package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.Repository.EventRepository;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.entity.Event;
import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.DTO.ErrorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @GetMapping("/verifications")
    public ResponseEntity<?> getAllVerifications() {
        try {
            List<User> users = userRepository.findAll();
            List<User> allUsers = users.stream()
                    .filter(user -> user.getRole() != User.Role.ADMIN)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(allUsers);
        } catch (Exception e) {
            log.error("Error fetching verifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch verifications"));
        }
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approveUser(@PathVariable String userId) {
        try {
            java.util.Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setVerificationStatus(User.VerificationStatus.APPROVED);
                userRepository.save(user);
                log.info("User {} approved", userId);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("User not found"));
            }
        } catch (Exception e) {
            log.error("Error approving user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to approve user"));
        }
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<?> rejectUser(@PathVariable String userId) {
        try {
            java.util.Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setVerificationStatus(User.VerificationStatus.REJECTED);
                userRepository.save(user);
                log.info("User {} rejected", userId);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("User not found"));
            }
        } catch (Exception e) {
            log.error("Error rejecting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to reject user"));
        }
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventDTO>> getAllEventsForAdmin() {
        try {
            List<Event> events = eventRepository.findAll();
            List<EventDTO> eventDTOs = events.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(eventDTOs);
        } catch (Exception e) {
            log.error("Error fetching events for admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    @PostMapping("/events/{eventId}/feature")
    public ResponseEntity<EventDTO> featureEvent(@PathVariable String eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            event.setFeatured(true);
            Event savedEvent = eventRepository.save(event);
            log.info("Event {} featured by admin", eventId);
            return ResponseEntity.ok(convertToDTO(savedEvent));
        } catch (Exception e) {
            log.error("Error featuring event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/events/{eventId}/unfeature")
    public ResponseEntity<EventDTO> unfeatureEvent(@PathVariable String eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            event.setFeatured(false);
            Event savedEvent = eventRepository.save(event);
            log.info("Event {} unfeatured by admin", eventId);
            return ResponseEntity.ok(convertToDTO(savedEvent));
        } catch (Exception e) {
            log.error("Error unfeaturing event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String eventId) {
        try {
            if (!eventRepository.existsById(eventId)) {
                return ResponseEntity.notFound().build();
            }
            eventRepository.deleteById(eventId);
            log.info("Event {} deleted by admin", eventId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDay(event.getDay());
        dto.setMonth(event.getMonth());
        dto.setStarttime(event.getStarttime());
        dto.setEndtime(event.getEndtime());
        dto.setTime(event.getTime());
        dto.setDescription(event.getDescription());
        dto.setCategory(event.getCategory());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setVirtualLink(event.getVirtualLink());
        dto.setOrganizerName(event.getOrganizerName());
        dto.setOrganizerContact(event.getOrganizerContact());
        dto.setLocation(event.getLocation());
        dto.setFeatured(event.isFeatured());
        return dto;
    }

    // Temporary endpoint for testing - Create admin user
    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdminUser() {
        try {
            // This is a temporary endpoint for testing purposes
            // In production, this should be removed or properly secured
            return ResponseEntity.ok("Admin user creation endpoint available for testing");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create admin user: " + e.getMessage());
        }
    }
}
