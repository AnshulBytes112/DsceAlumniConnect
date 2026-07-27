package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Service.ResumeFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping({ "/api/files", "/files" })
@RequiredArgsConstructor
public class FileController {

    private final ResumeFileService resumeFileService;

    @PostMapping("/users/{id}/resume")
    public ResponseEntity<String> uploadResume(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        try {
            String path = resumeFileService.uploadResumeWithAuth(id, file, authentication);
            return ResponseEntity.ok("Resume uploaded successfully");
        } catch (IllegalArgumentException e) {
            log.warn("Unauthorized resume upload attempt: {}", e.getMessage());
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}/resume")
    public ResponseEntity<?> getResume(
            @PathVariable String id,
            Authentication authentication) throws IOException {
        
        return resumeFileService.getResumeWithAuth(id, authentication);
    }
}
