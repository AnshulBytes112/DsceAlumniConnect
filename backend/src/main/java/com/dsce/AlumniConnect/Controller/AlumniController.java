package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Service.AlumniService;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AlumniController {

    private final AlumniService alumniservice;

    @GetMapping("/alumni/check")
    public ResponseEntity<String> checkAlumniRouter() {
        log.info("Alumni router check hit!");
        return ResponseEntity.ok("Alumni Router is working!");
    }

    @GetMapping("/alumni")
    public ResponseEntity<?> getAllAlumni() {
        List<User> allAlum = alumniservice.getAllAlumni();
        log.info("Returning {} alumni. IDs: {}", allAlum.size(),
                allAlum.stream().map(User::getId).collect(java.util.stream.Collectors.toList()));

        if (allAlum.isEmpty()) {
            log.info("No alumni found");
        }
        return ResponseEntity.ok(allAlum);
    }

    @GetMapping("/alumni/{id}")
    public ResponseEntity<?> getAlumniById(@PathVariable String id) {
        log.info("Fetching alumni details for ID: {}", id);
        return alumniservice.getAlumniById(id)
                .map(user -> {
                    log.info("Found alumni: {}", user.getEmail());
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    log.warn("Alumni not found for ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
}
