package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.Service.FileStorageService;
import com.dsce.AlumniConnect.entity.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping({ "/api/files", "/files" })
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/users/{id}/resume")
    public ResponseEntity<String> uploadResume(@PathVariable String id,
            @RequestParam("file") MultipartFile file, Authentication authentication) throws IOException {
        String uname = userRepository.findById(id).orElseThrow().getEmail();
        if (!authentication.getName().equals(uname) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("You are not authorized to upload resume for this user.");
        }

        String path = fileStorageService.uploadResume(file);
        User user = userRepository.findById(id).orElseThrow();
        user.setResumeUrl(path);
        userRepository.save(user);
        return ResponseEntity.ok("Resume uploaded successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}/resume")
    public ResponseEntity<Resource> getResume(@PathVariable String id, Authentication authentication) throws IOException {
        User user = userRepository.findById(id).orElseThrow();
        
        // Check if user has resume
        if (user.getResumeUrl() == null || user.getResumeUrl().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Path path = fileStorageService.getFilePath(user.getResumeUrl());
        Resource resource = new UrlResource(path.toUri());

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + path.getFileName().toString() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

}
