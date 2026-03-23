/**
 * TypeScript script to parse resume from PDF using local Ollama instance (llama3)
 * This script is called from the Java backend
 * 
 * Usage: tsx parse-resume-ollama.ts <pdf-file-path>
 * Output: JSON string mapping to ResumeParserResponse DTO in Java
 */

import { readPdf } from "./parse-resume-from-pdf/read-pdf";
import * as path from "path";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "gemma:2b";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const SYSTEM_PROMPT = `You are an expert resume parsing AI. Your ONLY task is to extract information from the provided resume text and generate a strict, flat JSON object.
Return ONLY valid, parseable JSON. Do not include any explanations, markdown code blocks (like \`\`\`json), or conversational text. If a field is not found, use an empty string "" for strings, false for booleans, or [] for arrays.

The output MUST strictly conform to this JSON structure:
{
  "profile": {
    "name": "",
    "email": "",
    "phone": "",
    "url": "",
    "summary": "",
    "location": ""
  },
  "workExperiences": [
    {
      "company": "",
      "jobTitle": "",
      "month": "",
      "year": "",
      "endMonth": "",
      "endYear": "",
      "currentlyWorking": false,
      "date": "",
      "descriptions": []
    }
  ],
  "educations": [
    {
      "school": "",
      "degree": "",
      "month": "",
      "year": "",
      "endMonth": "",
      "endYear": "",
      "currentlyPursuing": false,
      "date": "",
      "gpa": "",
      "descriptions": []
    }
  ],
  "projects": [
    {
      "project": "",
      "date": "",
      "descriptions": []
    }
  ],
  "skills": {
    "featuredSkills": [
      {"skill": "", "rating": 5}
    ],
    "descriptions": []
  }
}

Use common sense to format dates into month and year if possible. Extract bullet points cleanly into the 'descriptions' arrays.`;

/**
 * Trims and cleans the raw text to reduce token usage and improve LLM accuracy
 */
function cleanInputText(text: string): string {
    if (!text) return "";
    // Optional: remove non-printable characters or excessive whitespace
    return text
        .replace(/[^\x20-\x7E\n]/g, "") // Keep only printable ASCII and newlines
        .replace(/\n\s*\n/g, "\n")      // Remove multiple blank lines
        .trim();
}

/**
 * Validates if the parsed JSON generally matches the required structure
 */
function validateJsonStructure(obj: any): boolean {
    if (!obj || typeof obj !== "object") return false;
    if (!obj.profile) return false;

    // Ensure arrays exist
    if (!Array.isArray(obj.workExperiences)) obj.workExperiences = [];
    if (!Array.isArray(obj.educations)) obj.educations = [];
    if (!Array.isArray(obj.projects)) obj.projects = [];
    if (!obj.skills) obj.skills = { featuredSkills: [], descriptions: [] };

    return true;
}

/**
 * Sends request to Ollama with retry logic
 */
async function callOllamaWithRetry(prompt: string, attempt: number = 1): Promise<any> {
    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: `${SYSTEM_PROMPT}\n\nResume Text:\n${prompt}`,
                stream: false,
                format: "json",
                options: {
                    temperature: 0.1, // Low temperature for more deterministic JSON
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama HTTP Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        let responseText = result.response;

        // Remove any markdown code block wrappers if they slipped through
        if (responseText.startsWith("\`\`\`json")) {
            responseText = responseText.replace(/^\`\`\`json/g, "").replace(/\`\`\`$/g, "").trim();
        } else if (responseText.startsWith("\`\`\`")) {
            responseText = responseText.replace(/^\`\`\`/g, "").replace(/\`\`\`$/g, "").trim();
        }

        const parsedData = JSON.parse(responseText);

        if (validateJsonStructure(parsedData)) {
            return parsedData;
        } else {
            throw new Error("Parsed JSON does not match required schema");
        }
    } catch (error: any) {
        if (attempt < MAX_RETRIES) {
            // console.error(`[Attempt ${attempt} failed] ${error.message}. Retrying in ${RETRY_DELAY_MS}ms...`);
            await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
            return callOllamaWithRetry(prompt, attempt + 1);
        } else {
            throw error;
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const filePath = args.find((arg: string) => !arg.startsWith("--"));

    if (!filePath) {
        console.error(JSON.stringify({
            error: { code: 'INVALID_ARGS', message: 'Usage: tsx parse-resume-ollama.ts <pdf-file-path>' }
        }));
        process.exit(1);
    }

    try {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(process.cwd(), filePath);
        const fileUrl = `file://${absolutePath}`;

        // 1. Read PDF
        // readPdf returns an array of TextItem objects
        const textItems = await readPdf(fileUrl);

        // 2. Extract and format text
        let rawText = textItems.map((item) => item.text).join(" ");
        let cleanedText = cleanInputText(rawText);

        if (!cleanedText) {
            throw new Error("Failed to extract any text from the PDF");
        }

        // 3. Call Ollama with Retries & JSON Validation
        const parsedJson = await callOllamaWithRetry(cleanedText);

        // 4. Print valid JSON to stdout
        console.log(JSON.stringify(parsedJson, null, 2));

    } catch (error: any) {
        console.error(JSON.stringify({
            error: {
                code: 'OLLAMA_PARSING_ERROR',
                message: error.message || 'An unexpected error occurred during AI parsing'
            }
        }));
        process.exit(1);
    }
}

main();
