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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
public class GeminiResumeService {

    @Value("${resume.ai.provider:gemini}")
    private String resumeAiProvider;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.version:v1}")
    private String apiVersion;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

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
            log.info("Starting resume parsing with provider '{}' for file: {}", resumeAiProvider, pdfFilePath);

            // Extract text from PDF
            String pdfText = extractTextFromPDF(pdfFilePath);
            if (pdfText == null || pdfText.trim().isEmpty()) {
                throw new RuntimeException("Failed to extract text from PDF");
            }

            log.info("Extracted {} characters from PDF", pdfText.length());

            // Call selected AI provider
            String jsonResponse = callAIProvider(pdfText);

            // Normalize provider output to a stable DTO shape expected by downstream profile mapping.
            String normalizedJson = normalizeResumeJsonForDto(jsonResponse);

            // Parse the response
            ResumeParserResponse response = objectMapper.readValue(normalizedJson, ResumeParserResponse.class);

            log.info("Resume parsed successfully. Profile: {}, WorkExps: {}, Educations: {}, Projects: {}, Skills: {}",
                    response.getProfile() != null ? "present" : "null",
                    response.getWorkExperiences() != null ? response.getWorkExperiences().size() : 0,
                    response.getEducations() != null ? response.getEducations().size() : 0,
                    response.getProjects() != null ? response.getProjects().size() : 0,
                    response.getSkills() != null ? "present" : "null");

            return response;

        } catch (Exception e) {
            log.error("Error parsing resume with provider '{}': {}", resumeAiProvider, e.getMessage(), e);
            throw new Exception("Failed to parse resume with provider " + resumeAiProvider + ": " + e.getMessage(), e);
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
    private String callAIProvider(String resumeText) throws Exception {
        String provider = resumeAiProvider == null ? "gemini" : resumeAiProvider.trim().toLowerCase(Locale.ROOT);
        if ("groq".equals(provider)) {
            return callGroqAPI(resumeText);
        }
        return callGeminiAPI(resumeText);
    }

    private String callGeminiAPI(String resumeText) throws Exception {
        String prompt = buildPrompt(resumeText);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.info("Calling Gemini API (attempt {}/{})", attempt, MAX_RETRIES);
                return makeGeminiRequest(prompt);
            } catch (Exception e) {
                log.warn("Attempt {} failed: {}", attempt, e.getMessage());

                // Quota and rate-limit errors are not recoverable with immediate retries.
                if (isQuotaOrRateLimitError(e)) {
                    throw new RuntimeException("Gemini API quota exceeded. Please retry later or update API billing/quota.");
                }
                
                if (attempt < MAX_RETRIES) {
                    Thread.sleep(RETRY_DELAY_MS * attempt);
                } else {
                    throw e;
                }
            }
        }

        throw new RuntimeException("Failed to parse resume after " + MAX_RETRIES + " attempts");
    }

    private String callGroqAPI(String resumeText) throws Exception {
        String prompt = buildPrompt(resumeText);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.info("Calling Groq API (attempt {}/{})", attempt, MAX_RETRIES);
                return makeGroqRequest(prompt);
            } catch (Exception e) {
                log.warn("Groq attempt {} failed: {}", attempt, e.getMessage());

                if (isQuotaOrRateLimitError(e)) {
                    throw new RuntimeException("Groq API quota exceeded. Please retry later or update API billing/quota.");
                }

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

    private String makeGroqRequest(String prompt) throws Exception {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            throw new RuntimeException("Groq API key not configured. Set GROQ_API_KEY environment variable.");
        }

        String requestBody = buildGroqRequestJson(prompt);
        return executeGroqRequest(groqApiUrl, requestBody, groqModel);
    }

    private String buildGenerateContentUrl(String model) {
        return GEMINI_API_URL
                .replace("{version}", apiVersion)
                .replace("{model}", model) + "?key=" + geminiApiKey;
    }

    private boolean isNotFoundError(RuntimeException ex) {
        return ex.getMessage() != null && ex.getMessage().contains("404");
    }

    private boolean isQuotaOrRateLimitError(Exception ex) {
        String message = ex.getMessage();
        if (message == null) {
            return false;
        }

        String lowerMessage = message.toLowerCase(Locale.ROOT);
        return lowerMessage.contains("429")
                || lowerMessage.contains("resource_exhausted")
                || lowerMessage.contains("quota")
                || lowerMessage.contains("rate limit");
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

            if (response.statusCode() == 429) {
                throw new RuntimeException("Gemini API quota exceeded (429): RESOURCE_EXHAUSTED");
            }

            throw new RuntimeException("Gemini API error: " + response.statusCode() + " - " + response.body());
        }

        return extractJsonFromGeminiResponse(response.body());
    }

    private String executeGroqRequest(String url, String requestBody, String modelForLog) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        log.debug("Sending request to Groq API with model: {}", modelForLog);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Groq API returned status code: {}. Response: {}", response.statusCode(), response.body());

            if (response.statusCode() == 429) {
                throw new RuntimeException("Groq API quota exceeded (429): RATE_LIMIT_EXCEEDED");
            }

            throw new RuntimeException("Groq API error: " + response.statusCode() + " - " + response.body());
        }

        return extractJsonFromGroqResponse(response.body());
    }

    /**
     * Build the request JSON for Gemini API
     */
    private String buildRequestJson(String prompt) throws Exception {
        return "{\"contents\": [{\"parts\": [{\"text\": " + 
               objectMapper.writeValueAsString(prompt) + "}]}]}";
    }

    private String buildGroqRequestJson(String prompt) throws Exception {
        String escapedModel = objectMapper.writeValueAsString(groqModel);
        String escapedPrompt = objectMapper.writeValueAsString(prompt);

        return "{" +
                "\"model\":" + escapedModel + "," +
                "\"temperature\":0.1," +
                "\"messages\":[" +
                "{\"role\":\"user\",\"content\":" + escapedPrompt + "}" +
                "]" +
                "}";
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

    private String extractJsonFromGroqResponse(String apiResponse) throws Exception {
        var responseNode = objectMapper.readTree(apiResponse);

        if (!responseNode.has("choices") || responseNode.get("choices").isEmpty()) {
            throw new RuntimeException("Invalid Groq API response: no choices");
        }

        var choices = responseNode.get("choices");
        var message = choices.get(0).get("message");
        if (message == null || message.get("content") == null) {
            throw new RuntimeException("Invalid Groq API response: missing message content");
        }

        String textContent = message.get("content").asText();
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

    private String normalizeResumeJsonForDto(String rawJson) throws Exception {
        var root = objectMapper.readTree(rawJson);
        var normalized = objectMapper.createObjectNode();

        var profileNode = root.path("profile");
        var normalizedProfile = objectMapper.createObjectNode();
        normalizedProfile.put("name", readText(profileNode, root, "name", "fullName"));
        normalizedProfile.put("email", readText(profileNode, root, "email"));
        normalizedProfile.put("phone", readText(profileNode, root, "phone", "contactNumber", "mobile"));
        normalizedProfile.put("url", readText(profileNode, root, "url", "website", "linkedinProfile", "linkedin"));
        normalizedProfile.put("summary", readText(profileNode, root, "summary", "bio", "headline"));
        normalizedProfile.put("location", readText(profileNode, root, "location", "address"));
        normalized.set("profile", normalizedProfile);

        normalized.set("workExperiences", readArray(root, "workExperiences", "workExperience", "experiences", "experience"));
        normalized.set("educations", readArray(root, "educations", "education"));
        normalized.set("projects", readArray(root, "projects", "project"));
        normalized.set("achievements", normalizeAchievementsArray(root));

        var normalizedSkills = objectMapper.createObjectNode();
        var sourceSkills = root.path("skills");
        var featuredSkills = readArray(root, "featuredSkills");
        var descriptions = objectMapper.createArrayNode();

        if (sourceSkills.isObject()) {
            var objFeatured = sourceSkills.path("featuredSkills");
            if (featuredSkills.isEmpty() && objFeatured.isArray()) {
                featuredSkills = objFeatured;
            }
            var objDescriptions = sourceSkills.path("descriptions");
            if (objDescriptions.isArray()) {
                descriptions = objDescriptions.deepCopy();
            }
        } else if (sourceSkills.isArray()) {
            for (var node : sourceSkills) {
                if (node != null && node.isTextual() && !node.asText().isBlank()) {
                    descriptions.add(node.asText().trim());
                }
            }
        } else if (sourceSkills.isTextual() && !sourceSkills.asText().isBlank()) {
            List<String> splitSkills = splitCsvValues(sourceSkills.asText());
            for (String skill : splitSkills) {
                descriptions.add(skill);
            }
        }

        normalizedSkills.set("featuredSkills", featuredSkills.isArray() ? featuredSkills : objectMapper.createArrayNode());
        normalizedSkills.set("descriptions", descriptions);
        normalized.set("skills", normalizedSkills);

        return objectMapper.writeValueAsString(normalized);
    }

    private com.fasterxml.jackson.databind.JsonNode normalizeAchievementsArray(com.fasterxml.jackson.databind.JsonNode root) {
        var achievementsNode = readArray(root, "achievements", "awards", "certifications", "honors");
        var normalized = objectMapper.createArrayNode();

        if (!achievementsNode.isArray()) {
            return normalized;
        }

        for (var node : achievementsNode) {
            if (node == null || node.isNull()) {
                continue;
            }

            var item = objectMapper.createObjectNode();
            if (node.isTextual()) {
                String text = node.asText("").trim();
                if (text.isEmpty()) {
                    continue;
                }
                item.put("title", text);
                item.put("description", "");
                item.put("date", "");
                normalized.add(item);
                continue;
            }

            String title = readText(node, root, "title", "name", "award", "achievement");
            String description = readText(node, root, "description", "details", "summary");
            String date = readText(node, root, "date", "year", "issued", "awardedOn");

            if (title.isEmpty() && description.isEmpty()) {
                continue;
            }

            item.put("title", title);
            item.put("description", description);
            item.put("date", date);
            normalized.add(item);
        }

        return normalized;
    }

    private String readText(com.fasterxml.jackson.databind.JsonNode primary,
                            com.fasterxml.jackson.databind.JsonNode fallback,
                            String... keys) {
        for (String key : keys) {
            if (primary != null && primary.has(key) && !primary.get(key).isNull()) {
                String value = primary.get(key).asText("").trim();
                if (!value.isEmpty()) {
                    return value;
                }
            }
            if (fallback != null && fallback.has(key) && !fallback.get(key).isNull()) {
                String value = fallback.get(key).asText("").trim();
                if (!value.isEmpty()) {
                    return value;
                }
            }
        }
        return "";
    }

    private com.fasterxml.jackson.databind.JsonNode readArray(com.fasterxml.jackson.databind.JsonNode root,
                                                              String... keys) {
        for (String key : keys) {
            if (root.has(key) && root.get(key).isArray()) {
                return root.get(key).deepCopy();
            }
        }
        return objectMapper.createArrayNode();
    }

    private List<String> splitCsvValues(String value) {
        List<String> parts = new ArrayList<>();
        if (value == null || value.isBlank()) {
            return parts;
        }

        String[] tokens = value.split(",");
        for (String token : tokens) {
            if (token != null) {
                String trimmed = token.trim();
                if (!trimmed.isEmpty()) {
                    parts.add(trimmed);
                }
            }
        }
        return parts;
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
                                    "achievements": [
                                        {
                                            "title": "string",
                                            "description": "string",
                                            "date": "string"
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
