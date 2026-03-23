package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ResumeParserService {

    @Value("${file.upload.base-dir}")
    private String baseUploadDir;

    private final ObjectMapper objectMapper;

    private static final int PROCESS_TIMEOUT_SECONDS = 120;

    public ResumeParserService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        // ✅ PRODUCTION SAFE CONFIG
        this.objectMapper.configure(
                DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false
        );
    }

    // ===========================
    // 🔥 PDF PARSER (FIXED)
    // ===========================
    public ResumeParserResponse parseResume(String pdfFilePath) throws Exception {
        try {
            File openResumeDir = new File(
                "C:\\Users\\ankit\\OneDrive\\Desktop\\alumni_dev\\DsceAlumniConnect\\backend\\open_resume"
            );

            if (!openResumeDir.exists()) {
                throw new RuntimeException(
                        "open_resume directory NOT FOUND: " + openResumeDir.getAbsolutePath()
                );
            }

            // ✅ FIX: Proper ProcessBuilder
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "node",
                    "node_modules/tsx/dist/cli.mjs",
                    "parse-resume-ollama.ts",
                    pdfFilePath
            );

            processBuilder.directory(openResumeDir);
            processBuilder.redirectErrorStream(false);

            Process process = processBuilder.start();

            StringBuilder output = new StringBuilder();
            StringBuilder errorOutput = new StringBuilder();

            // stderr thread
            Thread stderrThread = new Thread(() -> {
                try (BufferedReader errReader = new BufferedReader(
                        new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = errReader.readLine()) != null) {
                        errorOutput.append(line).append("\n");
                    }
                } catch (Exception ignored) {}
            });
            stderrThread.start();

            // stdout
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            boolean finished = process.waitFor(PROCESS_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Process timeout");
            }

            if (process.exitValue() != 0) {
                throw new RuntimeException("Node error: " + errorOutput);
            }

            String rawOutput = output.toString().trim();
            log.info("NODE RAW OUTPUT:\n{}", rawOutput);

            String jsonOutput = extractJson(rawOutput);

            return objectMapper.readValue(jsonOutput, ResumeParserResponse.class);

        } catch (Exception e) {
            log.error("PDF parsing failed: {}", e.getMessage(), e);
            throw new Exception("Failed to parse resume: " + e.getMessage(), e);
        }
    }

    // ===========================
    // 🔥 TEXT PARSER (OLLAMA)
    // ===========================
    public ResumeParserResponse parseResumeText(String text) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "http://localhost:11434/api/generate";

            String prompt = """
You are a resume parsing engine.

Return STRICT JSON ONLY.
Fix this resume text with strict requirements:
     SECTION IDENTIFICATION:
        - Lines starting with "Description", "Experience", etc. are section headers
        - ALL lines in Description section must start with bullet points
        - Only text after a blank line following section headers can be bullet points

     1. BULLET POINTS (•, *, -):
        - NEVER split any bullet point across lines
        - Combine any bullet fragments into complete single-line bullets
        - Preserve the original bullet character (•, *, or -)
        - Only fix spacing BETWEEN words, never within proper nouns/technical terms
        - If the first point in regular text does not start with a bullet, add a bullet point at the start of the first line.
        - If a bullet point is missing a bullet character, add it at the start of the line.
        - ALL the points under DESCRIPTION should START with a BULLET character.

     2. LINE BREAKS:
        - Remove ALL mid-sentence line breaks
        - Keep exactly one line break between distinct bullet points
        - Keep exactly two line breaks between sections

     3. SPACING:
        - Add missing spaces between words ("ImplementedAES-200" → "Implemented AES-200")
        - Also add a space when a lowercase letter is immediately followed by an uppercase letter in all sections of the resume.
        - Never modify: 
          * Technical terms ("RESTful", "CRUD")
          * Proper nouns ("GLibC", "PBKDF2")
          * Numbers/dates ("2000+", "2023-2024")
          * Project names ("ELISA project")

     4. SPECIAL CASES:
        - Preserve all hyphenated terms as-is ("end-to-end")
        - Keep all acronyms intact ("APIs" not "A P Is")
        - Maintain exact company/product names ("Intel/Mobileye")

     REQUIRED OUTPUT FORMAT:
     - Each bullet point exactly one line
     - Add bullet to first point.
     - No trailing spaces
     - No empty lines between bullets
     - Exactly one blank line between sections

      Examples:
      - "VSCodeand" should become "VSCode and"
      - "developingcross-platform" should become "developing cross-platform" 
      - "Serverusing" should become "Server using"

      Text to fix:
      ${text}

      Return only the corrected text with proper spacing, no additional commentary.

Schema:
{
  "profile": {
    "name": "",
    "email": "",
    "phone": "",
    "url": "",
    "summary": "",
    "location": ""
  },
  "workExperiences": [],
  "educations": [],
  "projects": [],
  "skills": []
}

Resume:
""" + text;

            Map<String, Object> request = new HashMap<>();
            request.put("model", "gemma:2b"); // ✅ YOUR CURRENT MODEL
            request.put("prompt", prompt);
            request.put("stream", false);
            request.put("format", "json"); // ✅ CRITICAL

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() == null) {
                throw new RuntimeException("Empty response from LLM");
            }

            String modelOutput = (String) response.getBody().get("response");

            log.info("LLM RAW OUTPUT:\n{}", modelOutput);

            String json = extractJson(modelOutput);

            return objectMapper.readValue(json, ResumeParserResponse.class);

        } catch (Exception e) {
            log.error("Ollama parsing failed: {}", e.getMessage(), e);
            throw new RuntimeException("LLM parsing failed: " + e.getMessage(), e);
        }
    }

    // ===========================
    // 🔥 JSON CLEANER
    // ===========================
    private String extractJson(String text) {
        if (text == null || text.isEmpty()) {
            throw new RuntimeException("Empty response from model");
        }

        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");

        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1);
        }

        throw new RuntimeException("Invalid JSON from model: " + text);
    }

    // ===========================
    // 🔥 RELATIVE PATH SUPPORT
    // ===========================
    public ResumeParserResponse parseResumeFromRelativePath(String relativePath) throws Exception {
        Path fullPath = Paths.get(baseUploadDir, relativePath);
        return parseResume(fullPath.toAbsolutePath().toString());
    }
}