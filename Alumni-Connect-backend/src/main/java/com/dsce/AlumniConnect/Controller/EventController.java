package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.Service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/api/events", "/events" })
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEventsWithUserStatus());
    }

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.createEvent(eventDTO));
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<Void> rsvpEvent(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        eventService.rsvpEvent(id, status);
        return ResponseEntity.ok().build();
    }
}
