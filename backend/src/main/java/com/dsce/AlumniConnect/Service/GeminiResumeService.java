package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.ResumeParserResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Service
public class GeminiResumeService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.version:v1}")
    private String apiVersion;

    private final ObjectMapper objectMapper;
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent";
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000;
        private static final String[] FALLBACK_MODELS = {
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite"
        };

    public GeminiResumeService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Parse resume PDF using Gemini API
     */
    public ResumeParserResponse parseResumeWithGemini(String pdfFilePath) throws Exception {
        try {
            log.info("Starting resume parsing with Gemini API for file: {}", pdfFilePath);

            // Extract text from PDF
            String pdfText = extractTextFromPDF(pdfFilePath);
            if (pdfText == null || pdfText.trim().isEmpty()) {
                throw new RuntimeException("Failed to extract text from PDF");
            }

            log.info("Extracted {} characters from PDF", pdfText.length());

            // Call Gemini API
            String jsonResponse = callGeminiAPI(pdfText);

            // Parse the response
            ResumeParserResponse response = objectMapper.readValue(jsonResponse, ResumeParserResponse.class);

            log.info("Resume parsed successfully. Profile: {}, WorkExps: {}, Educations: {}, Projects: {}, Skills: {}",
                    response.getProfile() != null ? "present" : "null",
                    response.getWorkExperiences() != null ? response.getWorkExperiences().size() : 0,
                    response.getEducations() != null ? response.getEducations().size() : 0,
                    response.getProjects() != null ? response.getProjects().size() : 0,
                    response.getSkills() != null ? "present" : "null");

            return response;

        } catch (Exception e) {
            log.error("Error parsing resume with Gemini: {}", e.getMessage(), e);
            throw new Exception("Failed to parse resume with Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Extract text from PDF file
     */
    private String extractTextFromPDF(String pdfFilePath) throws Exception {
        File file = new File(pdfFilePath);
        
        if (!file.exists()) {
            throw new RuntimeException("PDF file not found: " + pdfFilePath);
        }

        StringBuilder textContent = new StringBuilder();

        try {
            // Use Loader.loadPDF for PDFBox 3.x compatibility
            PDDocument document = Loader.loadPDF(file);

            try {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                textContent.append(text);
            } finally {
                document.close();
            }

        } catch (Exception e) {
            log.error("Error extracting text from PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage(), e);
        }

        return textContent.toString().trim();
    }

    /**
     * Call Gemini API with retry logic
     */
    private String callGeminiAPI(String resumeText) throws Exception {
        String prompt = buildPrompt(resumeText);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.info("Calling Gemini API (attempt {}/{})", attempt, MAX_RETRIES);
                return makeGeminiRequest(prompt);
            } catch (Exception e) {
                log.warn("Attempt {} failed: {}", attempt, e.getMessage());
                
                if (attempt < MAX_RETRIES) {
                    Thread.sleep(RETRY_DELAY_MS * attempt);
                } else {
                    throw e;
                }
            }
        }

        throw new RuntimeException("Failed to parse resume after " + MAX_RETRIES + " attempts");
    }

    /**
     * Make HTTP request to Gemini API
     */
    private String makeGeminiRequest(String prompt) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("Gemini API key not configured. Set GEMINI_API_KEY environment variable.");
        }

        String normalizedPrimaryModel = normalizeModelName(geminiModel);
        String primaryUrl = buildGenerateContentUrl(normalizedPrimaryModel);
        String requestBody = buildRequestJson(prompt);

        try {
            return executeGeminiRequest(primaryUrl, requestBody, normalizedPrimaryModel);
        } catch (RuntimeException ex) {
            if (isNotFoundError(ex)) {
                for (String fallbackModel : FALLBACK_MODELS) {
                    String normalizedFallback = normalizeModelName(fallbackModel);
                    if (normalizedFallback.equals(normalizedPrimaryModel)) {
                        continue;
                    }
                    try {
                        log.warn("Primary model '{}' not found. Retrying with fallback model '{}'.",
                                normalizedPrimaryModel, normalizedFallback);
                        String fallbackUrl = buildGenerateContentUrl(normalizedFallback);
                        return executeGeminiRequest(fallbackUrl, requestBody, normalizedFallback);
                    } catch (RuntimeException fallbackEx) {
                        if (!isNotFoundError(fallbackEx)) {
                            throw fallbackEx;
                        }
                    }
                }
                throw new RuntimeException("Gemini API model not found for configured and fallback models", ex);
            }
            throw ex;
        }
    }

    private String buildGenerateContentUrl(String model) {
        return GEMINI_API_URL
                .replace("{version}", apiVersion)
                .replace("{model}", model) + "?key=" + geminiApiKey;
    }

    private boolean isNotFoundError(RuntimeException ex) {
        return ex.getMessage() != null && ex.getMessage().contains("404");
    }

    private String normalizeModelName(String configuredModel) {
        if (configuredModel == null || configuredModel.isBlank()) {
            return "gemini-2.5-flash";
        }
        String trimmed = configuredModel.trim();
        if (trimmed.startsWith("models/")) {
            return trimmed.substring("models/".length());
        }
        return trimmed;
    }

    private String executeGeminiRequest(String url, String requestBody, String modelForLog) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        log.debug("Sending request to Gemini API with model: {}", modelForLog);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Gemini API returned status code: {}. Response: {}", response.statusCode(), response.body());
            throw new RuntimeException("Gemini API error: " + response.statusCode() + " - " + response.body());
        }

        return extractJsonFromGeminiResponse(response.body());
    }

    /**
     * Build the request JSON for Gemini API
     */
    private String buildRequestJson(String prompt) throws Exception {
        return "{\"contents\": [{\"parts\": [{\"text\": " + 
               objectMapper.writeValueAsString(prompt) + "}]}]}";
    }

    /**
     * Extract JSON from Gemini API response
     */
    private String extractJsonFromGeminiResponse(String apiResponse) throws Exception {
        // Parse the Gemini API response
        var responseNode = objectMapper.readTree(apiResponse);

        if (!responseNode.has("candidates") || responseNode.get("candidates").isEmpty()) {
            throw new RuntimeException("Invalid Gemini API response: no candidates");
        }

        var candidates = responseNode.get("candidates");
        var content = candidates.get(0).get("content");
        var parts = content.get("parts");
        var textContent = parts.get(0).get("text").asText();

        // Extract JSON from the text response (it might be wrapped in markdown)
        return extractJsonFromText(textContent);
    }

    /**
     * Extract JSON from text that might contain markdown code blocks
     */
    private String extractJsonFromText(String text) {
        // Remove markdown code blocks if present
        String json = text.replaceAll("```json|```", "").trim();
        
        // Find JSON content
        int jsonStart = json.indexOf('{');
        if (jsonStart != -1) {
            json = json.substring(jsonStart);
        }

        return json;
    }

    /**
     * Build the prompt for Gemini API to parse resume
     */
    private String buildPrompt(String resumeText) {
        return """
                You are an expert resume parser. Parse the following resume and return ONLY a valid JSON object with this exact structure:

                {
                  "profile": {
                    "name": "string",
                    "email": "string",
                    "phone": "string",
                    "url": "string",
                    "summary": "string",
                    "location": "string"
                  },
                  "workExperiences": [
                    {
                      "company": "string",
                      "jobTitle": "string",
                      "month": "string",
                      "year": "string",
                      "endMonth": "string",
                      "endYear": "string",
                      "currentlyWorking": boolean,
                      "date": "string",
                      "descriptions": ["string"]
                    }
                  ],
                  "educations": [
                    {
                      "school": "string",
                      "degree": "string",
                      "month": "string",
                      "year": "string",
                      "endMonth": "string",
                      "endYear": "string",
                      "currentlyPursuing": boolean,
                      "date": "string",
                      "gpa": "string",
                      "descriptions": ["string"]
                    }
                  ],
                  "projects": [
                    {
                      "project": "string",
                      "date": "string",
                      "descriptions": ["string"]
                    }
                  ],
                  "skills": {
                    "featuredSkills": [
                      {
                        "skill": "string",
                        "rating": number
                      }
                    ],
                    "descriptions": ["string"]
                  }
                }

                Rules:
                1. Extract ALL relevant information from the resume
                2. For dates, use month/year format if available
                3. For descriptions, return as array of strings (one per line or bullet point)
                4. If a field is not found, use null or empty array
                5. Infer currentlyWorking=true if no end date, false if end date exists
                6. Keep text concise and clean
                7. Return ONLY the JSON object, no additional text

                Resume text:
                """ + resumeText;
    }
}
