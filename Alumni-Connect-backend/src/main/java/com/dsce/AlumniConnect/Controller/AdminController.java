package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.User;
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
}
