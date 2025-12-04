package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class ResumeParserService {

    @Value("${file.upload.base-dir}")
    private String baseUploadDir;

    private final ObjectMapper objectMapper;

    // TODO : Need to use S3 bucket
    private static final String OPEN_RESUME_DIR = "open_resume";

    public ResumeParserService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    // Return parsed resume data
    public ResumeParserResponse parseResume(String pdfFilePath) throws Exception {
        try {

            // Load open-resume directory
            Path baseDir = Paths.get(baseUploadDir);
            Path openResumePath = baseDir.resolve("Alumni-Connect-backend").resolve(OPEN_RESUME_DIR);
            Path scriptPath = openResumePath.resolve("parse-resume.ts");

            // Check if script exists
            if (!scriptPath.toFile().exists()) {
                throw new RuntimeException("Resume parser script not found at: " + scriptPath);
            }

            // Build command to run the TypeScript parser
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "npx", "tsx", scriptPath.toString(), pdfFilePath);

            // Set working directory to open-resume directory
            processBuilder.directory(openResumePath.toFile());
            processBuilder.redirectErrorStream(true);

            log.info("Executing resume parser for file: {}", pdfFilePath);
            Process process = processBuilder.start();

            // Read output
            StringBuilder output = new StringBuilder();
            StringBuilder errorOutput = new StringBuilder();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            try (BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                String combinedOutput = output.toString() + "\n" + errorOutput.toString();
                log.error("Resume parser failed with exit code: {}\nOutput: {}", exitCode, combinedOutput);
                throw new RuntimeException("Resume parsing failed: " + combinedOutput);
            }

            String jsonOutput = output.toString().trim();

            // for debugging
            // log.info("Raw JSON output from parser (first 500 chars): {}",
            // jsonOutput.length() > 500 ? jsonOutput.substring(0, 500) + "..." :
            // jsonOutput);

            // Check if output contains error
            if (jsonOutput.startsWith("{\"error\"")) {
                throw new RuntimeException("Resume parser error: " + jsonOutput);
            }

            // Parse JSON response
            ResumeParserResponse response = objectMapper.readValue(jsonOutput, ResumeParserResponse.class);

            // for debugging
            // log.info("Resume parsed successfully. Profile: {}, WorkExps: {}, Educations:
            // {}, Projects: {}, Skills: {}",
            // response.getProfile() != null ? "present" : "null",
            // response.getWorkExperiences() != null ? response.getWorkExperiences().size()
            // : 0,
            // response.getEducations() != null ? response.getEducations().size() : 0,
            // response.getProjects() != null ? response.getProjects().size() : 0,
            // response.getSkills() != null ? "present" : "null");

            return response;

        } catch (Exception e) {
            log.error("Error parsing resume: {}", e.getMessage(), e);
            throw new Exception("Failed to parse resume: " + e.getMessage(), e);
        }
    }

    // TODO: Need to remove this method use S3 bucket path
    public ResumeParserResponse parseResumeFromRelativePath(String relativePath) throws Exception {
        Path fullPath = Paths.get(baseUploadDir, relativePath);
        return parseResume(fullPath.toAbsolutePath().toString());
    }
}
