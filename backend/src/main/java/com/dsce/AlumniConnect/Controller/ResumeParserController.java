package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.dsce.AlumniConnect.Service.ResumeParserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;

@Slf4j
@RestController
@RequestMapping({ "/api/resume", "/resume" })
public class ResumeParserController {

    @Autowired
    private ResumeParserService resumeParserService;

    private boolean isGeminiQuotaError(Exception e) {
        String message = e.getMessage();
        if (message == null) {
            return false;
        }

        String lowerMessage = message.toLowerCase(Locale.ROOT);
        return lowerMessage.contains("429")
                || lowerMessage.contains("resource_exhausted")
                || lowerMessage.contains("quota")
                || lowerMessage.contains("rate limit");
    }

    private boolean isPdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        try {
            byte[] header = file.getBytes();
            if (header.length < 4) {
                return false;
            }
            return header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F';
        } catch (IOException e) {
            log.warn("Unable to read resume file header", e);
            return false;
        }
    }

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

            if (!isPdfFile(file)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Only valid PDF files are supported"));
            }

            java.io.File tempFile = java.io.File.createTempFile("resume_parse_", ".pdf");
            try {
                file.transferTo(tempFile);
                // Parse the resume
                ResumeParserResponse response = resumeParserService.parseResume(tempFile.getAbsolutePath());
                return ResponseEntity.ok(response);
            } finally {
                if (tempFile.exists()) {
                    tempFile.delete();
                }
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            if (isGeminiQuotaError(e)) {
                log.warn("Gemini quota/rate-limit reached during resume parsing: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(new ErrorResponse("Resume parsing service is temporarily unavailable due to API quota limits. Please try again later."));
            }

            log.error("Error parsing resume: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to parse resume: " + e.getMessage()));
        }
    }

}

