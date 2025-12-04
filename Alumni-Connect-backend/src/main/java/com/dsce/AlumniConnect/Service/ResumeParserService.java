package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ResumeParserService {

    @Value("${file.upload.base-dir}")
    private String baseUploadDir;

    private final ObjectMapper objectMapper;

    private static final String OPEN_RESUME_DIR = "open-resume";
    private static final int PROCESS_TIMEOUT_SECONDS = 30;

    public ResumeParserService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

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

            // Check if PDF file exists
            if (!Paths.get(pdfFilePath).toFile().exists()) {
                throw new RuntimeException("PDF file not found at: " + pdfFilePath);
            }

            // Build command to run the TypeScript parser
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "C:\\Program Files\\nodejs\\npx.cmd", "tsx", scriptPath.toString(), pdfFilePath);

            // Set working directory to open-resume directory
            processBuilder.directory(openResumePath.toFile());

            // Merge error stream into output stream
            processBuilder.redirectErrorStream(true);

            log.info("Executing resume parser for file: {}", pdfFilePath);
            Process process = processBuilder.start();

            // Read all output (stdout + stderr merged)
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // Wait for process to complete with timeout
            boolean finished = process.waitFor(PROCESS_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Resume parsing timed out after " + PROCESS_TIMEOUT_SECONDS + " seconds");
            }

            int exitCode = process.exitValue();
            String rawOutput = output.toString().trim();

            // Log the raw output for debugging
            log.debug("Parser raw output (exit code {}): {}", exitCode, rawOutput);

            // Check for errors
            if (exitCode != 0 || rawOutput.contains("\"error\"")) {
                // Try to parse error message from JSON
                String errorMessage = rawOutput;
                try {
                    if (rawOutput.contains("\"error\"")) {
                        var errorNode = objectMapper.readTree(rawOutput);
                        if (errorNode.has("error")) {
                            errorMessage = errorNode.get("error").asText();
                        }
                    }
                } catch (Exception e) {
                    // If we can't parse the error JSON, use the raw output
                    log.debug("Could not parse error JSON, using raw output", e);
                }

                log.error("Resume parser failed with exit code: {}. Error: {}", exitCode, errorMessage);
                throw new RuntimeException("Resume parsing failed: " + errorMessage);
            }

            // Check if we got valid output
            if (rawOutput.isEmpty()) {
                throw new RuntimeException("Resume parser produced no output");
            }

            // CRITICAL FIX: Extract JSON from output (skip PDF.js warnings)
            String jsonOutput = extractJsonFromOutput(rawOutput);

            if (jsonOutput.isEmpty()) {
                log.error("No valid JSON found in parser output: {}", rawOutput);
                throw new RuntimeException("Resume parser produced no valid JSON output");
            }

            // Parse JSON response
            ResumeParserResponse response;
            try {
                response = objectMapper.readValue(jsonOutput, ResumeParserResponse.class);
            } catch (Exception e) {
                log.error("Failed to parse resume parser JSON output. JSON: {}", jsonOutput);
                throw new RuntimeException("Invalid JSON output from resume parser: " + e.getMessage(), e);
            }

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

    /**
     * Extracts valid JSON from parser output by filtering out PDF.js warnings.
     * PDF.js writes warnings to stdout which contaminate the JSON output.
     */
    private String extractJsonFromOutput(String rawOutput) {
        // Find the first line that starts with '{' (start of JSON)
        String[] lines = rawOutput.split("\n");
        StringBuilder jsonBuilder = new StringBuilder();
        boolean jsonStarted = false;

        for (String line : lines) {
            String trimmedLine = line.trim();

            // Skip warning lines
            if (trimmedLine.startsWith("Warning:")) {
                continue;
            }

            // Start collecting from the first line that begins with '{'
            if (!jsonStarted && trimmedLine.startsWith("{")) {
                jsonStarted = true;
            }

            // Collect all lines after JSON starts
            if (jsonStarted) {
                jsonBuilder.append(line).append("\n");
            }
        }

        return jsonBuilder.toString().trim();
    }

    public ResumeParserResponse parseResumeFromRelativePath(String relativePath) throws Exception {
        Path fullPath = Paths.get(baseUploadDir, relativePath);
        return parseResume(fullPath.toAbsolutePath().toString());
    }
}