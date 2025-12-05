package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.ProfileUpdateRequest;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.Service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping({ "/api/profile", "/profile" })
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final ObjectMapper objectMapper;

    // Get current user's profile
    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            User user = profileService.getCurrentUserProfile();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error getting profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to get profile: " + e.getMessage()));
        }
    }

    // Initial profile setup after signup
    @PostMapping(value = "/setup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> setupProfile(
            @RequestPart(value = "data", required = false) String profileDataJson,
            @RequestPart(value = "profile", required = false) MultipartFile profilePicture,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        try {
            log.info("Profile setup request received");
            User user = profileService.getCurrentUserProfile();

            // Update profile picture if provided
            if (profilePicture != null && !profilePicture.isEmpty()) {
                user = profileService.updateProfilePicture(profilePicture);
            }

            // Update profile data if provided
            if (profileDataJson != null && !profileDataJson.isEmpty()) {
                ProfileUpdateRequest request = objectMapper.readValue(profileDataJson, ProfileUpdateRequest.class);
                user = profileService.updateProfile(request);
            }

            // Upload and parse resume if provided
            if (resume != null && !resume.isEmpty()) {
                user = profileService.updateProfileFromResume(resume, false); // Don't replace existing data
            }

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error setting up profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to setup profile: " + e.getMessage()));
        }
    }

    // Update profile manually
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        try {
            log.info("Profile update request received");
            User updatedUser = profileService.updateProfile(request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    // Update profile picture
    @PostMapping("/picture")
    public ResponseEntity<?> updateProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Profile picture update request received");
            User updatedUser = profileService.updateProfilePicture(file);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Error uploading profile picture: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to upload profile picture: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating profile picture: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update profile picture: " + e.getMessage()));
        }
    }

    // Upload resume and parse it to update profile
    @PostMapping("/resume")
    public ResponseEntity<?> updateProfileFromResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "replaceExisting", defaultValue = "false") boolean replaceExisting) {
        try {
            log.info("Resume upload and parse request received, replaceExisting: {}", replaceExisting);
            User updatedUser = profileService.updateProfileFromResume(file, replaceExisting);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Error uploading resume: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to upload resume: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating profile from resume: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update profile from resume: " + e.getMessage()));
        }
    }

    // Parse existing resume and update profile
    @PostMapping("/resume/parse")
    public ResponseEntity<?> parseExistingResume(
            @RequestParam(value = "replaceExisting", defaultValue = "false") boolean replaceExisting) {
        try {
            log.info("Parse existing resume request received, replaceExisting: {}", replaceExisting);
            User updatedUser = profileService.parseExistingResume(replaceExisting);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error parsing existing resume: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to parse resume: " + e.getMessage()));
        }
    }
}
