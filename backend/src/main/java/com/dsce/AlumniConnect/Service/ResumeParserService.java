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

    private static final String OPEN_RESUME_DIR = "open_resume";
    private static final int PROCESS_TIMEOUT_SECONDS = 30;

    public ResumeParserService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ResumeParserResponse parseResume(String pdfFilePath) throws Exception {
        try {
            Path baseDir = Paths.get(baseUploadDir);
            Path openResumePath = baseDir.resolve(OPEN_RESUME_DIR);
            Path scriptPath = openResumePath.resolve("parse-resume.ts");

            if (!scriptPath.toFile().exists()) {
                throw new RuntimeException("Resume parser script not found at: " + scriptPath);
            }

            // Check if PDF file exists
            Path pdfPath = Paths.get(pdfFilePath);
            if (!pdfPath.toFile().exists()) {
                throw new RuntimeException("PDF file not found: " + pdfFilePath);
            }

            // Use local tsx CLI with Node to run the TypeScript script
            Path tsxCliPath = openResumePath.resolve("node_modules")
                    .resolve("tsx")
                    .resolve("dist")
                    .resolve("cli.mjs");

            if (!tsxCliPath.toFile().exists()) {
                throw new RuntimeException("tsx CLI not found at: " + tsxCliPath +
                        ". Make sure dependencies are installed with `npm install` in the open_resume directory.");
            }

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "node",
                    tsxCliPath.toAbsolutePath().toString(),
                    "parse-resume.ts",
                    pdfFilePath);
            processBuilder.directory(openResumePath.toFile());

            // Do NOT merge error stream - read them separately
            // so debug logs on stderr don't corrupt the JSON on stdout
            processBuilder.redirectErrorStream(false);

            log.info("Executing resume parser for file: {}", pdfFilePath);
            Process process = processBuilder.start();

            // Read stdout (JSON output) on the main thread
            StringBuilder output = new StringBuilder();
            StringBuilder errorOutput = new StringBuilder();

            // Read stderr on a separate thread to prevent deadlocks
            Thread stderrThread = new Thread(() -> {
                try (BufferedReader errReader = new BufferedReader(
                        new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = errReader.readLine()) != null) {
                        errorOutput.append(line).append("\n");
                    }
                } catch (Exception e) {
                    log.warn("Error reading stderr: {}", e.getMessage());
                }
            });
            stderrThread.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            stderrThread.join(PROCESS_TIMEOUT_SECONDS * 1000L);

            // Wait for process to complete with timeout
            boolean finished = process.waitFor(PROCESS_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Resume parsing timed out after " + PROCESS_TIMEOUT_SECONDS + " seconds");
            }

            int exitCode = process.exitValue();
            String rawOutput = output.toString().trim();
            String stderrOutput = errorOutput.toString().trim();

            // Log the raw output for debugging
            log.info("Parser exit code: {}", exitCode);
            if (!stderrOutput.isEmpty()) {
                log.info("Parser stderr output:\n{}", stderrOutput);
            }
            
            // Log first 500 chars of raw output for debugging
            String truncatedOutput = rawOutput.length() > 500 ? rawOutput.substring(0, 500) + "..." : rawOutput;
            log.info("Parser raw output preview:\n{}", truncatedOutput);

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

                log.error("Resume parser failed with exit code: {}\nOutput: {}", exitCode, errorMessage);
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