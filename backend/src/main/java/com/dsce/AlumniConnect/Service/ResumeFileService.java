package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * ResumeFileService
 * Handles resume upload, download, and access control
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeFileService {

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    /**
     * Upload resume for a user with authorization check
     */
    public String uploadResumeWithAuth(String userId, MultipartFile file, Authentication authentication) {
        log.info("Upload resume request for user {} from {}", userId, authentication.getName());
        
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // Check authorization: user can upload own resume or admin can upload for any user
        if (!isAuthorizedToUploadResume(userId, authentication)) {
            throw new IllegalArgumentException("You are not authorized to upload resume for this user.");
        }

        // Upload resume asynchronously
        String path = fileStorageService.uploadResume(file).join();
        
        // Update user's resume URL
        user.setResumeUrl(path);
        userRepository.save(user);
        
        log.info("Resume uploaded successfully for user {}", userId);
        return path;
    }

    /**
     * Get resume with authorization and URL handling
     */
    public ResponseEntity<?> getResumeWithAuth(String userId, Authentication authentication) throws IOException {
        log.info("Get resume request for user {} from {}", userId, authentication.getName());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // Check if user has resume
        if (user.getResumeUrl() == null || user.getResumeUrl().isEmpty()) {
            log.warn("No resume found for user {}", userId);
            throw new ResourceNotFoundException("Resume not found for user: " + userId);
        }

        return buildResumeResponse(user.getResumeUrl());
    }

    /**
     * Check if authentication is authorized to upload resume
     */
    private boolean isAuthorizedToUploadResume(String userId, Authentication authentication) {
        String authenticatedEmail = authentication.getName();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // User can upload own resume
        if (authenticatedEmail.equals(targetUser.getEmail())) {
            return true;
        }
        
        // Admin can upload for any user
        return hasAdminRole(authentication);
    }

    /**
     * Check if authentication has admin role
     */
    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    /**
     * Build resume response handling both Cloudinary and local files
     */
    private ResponseEntity<?> buildResumeResponse(String resumeUrl) throws IOException {
        // If it's a Cloudinary URL, redirect to a signed URL
        if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
            String signedUrl = fileStorageService.getSignedUrl(resumeUrl);
            return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                    .location(URI.create(signedUrl))
                    .build();
        }
        
        // Local resume paths are no longer supported. Reject anything that is not a Cloudinary URL.
        log.warn("Attempt to access legacy local resume path: {}", resumeUrl);
        throw new UnsupportedOperationException("Local resume download is no longer supported. Use Cloudinary URLs.");
    }
}
