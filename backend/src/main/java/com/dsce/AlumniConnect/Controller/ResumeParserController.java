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

import java.util.Map;

@Slf4j
@RestController
@RequestMapping({ "/api/resume", "/resume" })
public class ResumeParserController {

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private FileStorageService fileStorageService;

    // ===============================
    // 1. PARSE FROM PDF (FILE UPLOAD)
    // ===============================
    @PostMapping("/parse")
    public ResponseEntity<?> parseResume(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Resume parse request received for file: {}", file.getOriginalFilename());

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Resume file is required"));
            }

            if (!"application/pdf".equals(file.getContentType())) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Only PDF files are supported"));
            }

            String tempPath = fileStorageService.uploadResume(file);
            String fullPath = fileStorageService.getFilePath(tempPath).toAbsolutePath().toString();

            ResumeParserResponse response = resumeParserService.parseResume(fullPath);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error parsing resume file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to parse resume: " + e.getMessage()));
        }
    }

    // ===============================
    // 2. PARSE FROM RAW TEXT (🔥 NEW)
    // ===============================
   @PostMapping("/parse-text")
public ResponseEntity<?> parseText(@RequestBody Map<String, String> body) {
    String text = body.get("text");
    return ResponseEntity.ok(resumeParserService.parseResumeText(text));
}

    // ===============================
    // 3. PARSE FROM STORED FILE PATH
    // ===============================
    @GetMapping("/parse")
    public ResponseEntity<?> parseResumeFromPath(@RequestParam("path") String filePath) {
        try {
            log.info("Resume parse request received for path: {}", filePath);

            ResumeParserResponse response =
                    resumeParserService.parseResumeFromRelativePath(filePath);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error parsing resume from path", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to parse resume: " + e.getMessage()));
        }
    }
}