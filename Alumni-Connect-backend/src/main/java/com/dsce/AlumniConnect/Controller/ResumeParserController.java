package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.dsce.AlumniConnect.Service.FileStorageService;
import com.dsce.AlumniConnect.Service.ResumeParserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/resume")
public class ResumeParserController {

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private FileStorageService fileStorageService;

    // Parse resume from uploaded PDF file
    @PostMapping("/parse")
    public ResponseEntity<?> parseResume(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Resume parse request received for file: {}", file.getOriginalFilename());

            // Validate file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Resume file is required"));
            }

            // Check if it's a PDF
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Only PDF files are supported"));
            }

            // Save file temporarily
            String tempPath = fileStorageService.uploadResume(file);
            String fullPath = fileStorageService.getFilePath(tempPath).toAbsolutePath().toString();

            try {
                // Parse the resume
                ResumeParserResponse response = resumeParserService.parseResume(fullPath);

                // Optionally delete temp file after parsing
                // fileStorageService.deleteFile(tempPath);

                return ResponseEntity.ok(response);
            } catch (Exception e) {
                // Clean up temp file on error
                fileStorageService.deleteFile(tempPath);
                throw e;
            }

        } catch (IllegalArgumentException e) {
            log.error("Invalid file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error parsing resume: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to parse resume: " + e.getMessage()));
        }
    }

    // Parse resume from existing file path (relative to upload directory)
    @GetMapping("/parse")
    public ResponseEntity<?> parseResumeFromPath(@RequestParam("path") String filePath) {
        try {
            log.info("Resume parse request received for path: {}", filePath);

            ResumeParserResponse response = resumeParserService.parseResumeFromRelativePath(filePath);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error parsing resume: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to parse resume: " + e.getMessage()));
        }
    }
}
