/**
 * TypeScript script to parse resume from PDF using open-resume parser
 * This script is called from Java backend
 * 
 * Usage: tsx parse-resume.ts <pdf-file-path>
 * Output: JSON string with parsed resume data
 * 
 * Note: This script must be run from the open-resume directory root
 * with tsconfig.json path mappings configured
 */

// Use relative import to work with path aliases
import { parseResumeFromPdf } from "./parse-resume-from-pdf";

async function main() {
  const pdfFilePath = process.argv[2];

  if (!pdfFilePath) {
    console.error('Usage: tsx parse-resume.ts <pdf-file-path>');
    process.exit(1);
  }

  try {
    // Convert file path to file:// URL for the parser
    // Handle both absolute and relative paths
    const path = require('path');
    const absolutePath = path.isAbsolute(pdfFilePath)
      ? pdfFilePath
      : path.resolve(process.cwd(), pdfFilePath);
    const fileUrl = `file://${absolutePath}`;

    // Parse the resume
    const resume = await parseResumeFromPdf(fileUrl);

    // Output as JSON
    console.log(JSON.stringify(resume));
  } catch (error: any) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
}

main();

