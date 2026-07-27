package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class ResumeParserService {

    @Autowired
    private GeminiResumeService geminiResumeService;

    public ResumeParserResponse parseResume(String pdfFilePath) throws Exception {
        try {
            // Check if PDF file exists (skip check for URLs)
            if (pdfFilePath == null || (!pdfFilePath.startsWith("http://") && !pdfFilePath.startsWith("https://"))) {
                Path pdfPath = Paths.get(pdfFilePath);
                if (!pdfPath.toFile().exists()) {
                    throw new RuntimeException("PDF file not found: " + pdfFilePath);
                }
            }

            log.info("Parsing resume using Gemini API for file: {}", pdfFilePath);

            // Use Gemini API to parse the resume
            ResumeParserResponse response = geminiResumeService.parseResumeWithGemini(pdfFilePath);

            log.info("Resume parsed successfully. Profile: {}, WorkExps: {}, Educations: {}, Projects: {}, Skills: {}",
                    response.getProfile() != null ? "present" : "null",
                    response.getWorkExperiences() != null ? response.getWorkExperiences().size() : 0,
                    response.getEducations() != null ? response.getEducations().size() : 0,
                    response.getProjects() != null ? response.getProjects().size() : 0,
                    response.getSkills() != null ? "present" : "null");

            return response;

        } catch (Exception e) {
            log.error("Error parsing resume: {}", e.getMessage(), e);
            throw new Exception("Failed to parse resume: " + e.getMessage(), e);
        }
    }

}