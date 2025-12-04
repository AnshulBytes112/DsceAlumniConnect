# Resume Parser Service

This module is a specialized component of the AlumniConnect backend, responsible for parsing resume PDFs into structured JSON data.

## Acknowledgements

This resume parser implementation is adapted from the open-source project **[OpenResume](https://github.com/xitanggg/open-resume)**. We gratefully acknowledge their work in creating a powerful and privacy-focused resume parser.

## Purpose

The purpose of this module is to extract key information from uploaded resume PDFs, such as:
- Personal Profile (Name, Email, Phone, Location, etc.)
- Work Experience
- Education
- Projects
- Skills

This data is used to auto-populate user profiles in the AlumniConnect platform.

## Usage

This module is designed to be executed as a standalone script by the Java Spring Boot backend.

**Command:**
```bash
npx tsx parse-resume.ts <path-to-pdf>
```

**Output:**
Returns a JSON string containing the parsed resume data.

## Structure

- `parse-resume.ts`: The entry point script called by the backend.
- `parse-resume-from-pdf/`: Contains the core parsing logic and heuristics.
- `lib/`: Shared utilities and Redux definitions (preserved from the original project for type compatibility).
