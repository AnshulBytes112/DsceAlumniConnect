package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Service.ConnectionService;
import com.dsce.AlumniConnect.entity.ConnectionRequest;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<?> sendConnectionRequest(
            @PathVariable String receiverId,
            @AuthenticationPrincipal User currentUser) {
        
        try {
            ConnectionRequest request = connectionService.sendConnectionRequest(currentUser.getId(), receiverId);
            return ResponseEntity.ok(request);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Error sending connection request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Internal server error during connection request", e);
            return ResponseEntity.internalServerError().body("An error occurred");
        }
    }
}
