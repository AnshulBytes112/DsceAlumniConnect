import { readPdf } from './src/app/lib/parse-resume-from-pdf/read-pdf.js';
import { groupTextItemsIntoLines } from './src/app/lib/parse-resume-from-pdf/group-text-items-into-lines.js';
import { groupLinesIntoSections } from './src/app/lib/parse-resume-from-pdf/group-lines-into-sections.js';
import { extractResumeFromSections } from './src/app/lib/parse-resume-from-pdf/extract-resume-from-sections/index.js';
import * as fs from 'fs';
import * as path from 'path';

const pdfFilePath = process.argv[2];

if (!pdfFilePath) {
  console.error(JSON.stringify({ error: 'PDF file path is required' }));
  process.exit(1);
}

if (!fs.existsSync(pdfFilePath)) {
  console.error(JSON.stringify({ error: 'PDF file not found: ' + pdfFilePath }));
  process.exit(1);
}

async function parseResume() {
  try {
    // Disable PDF.js worker for Node.js environment
    // This must be done before any PDF operations
    const pdfjsLib = await import('pdfjs-dist');

    // Option 1: Disable worker entirely (simplest)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    // Option 2: Use the worker file if available (uncomment if you prefer)
    // const workerPath = path.join(
    //   path.dirname(require.resolve('pdfjs-dist/package.json')),
    //   'build',
    //   'pdf.worker.js'
    // );
    // pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

    // Read PDF
    const textItems = await readPdf(pdfFilePath);

    // Group text items into lines
    const lines = groupTextItemsIntoLines(textItems);

    // Group lines into sections
    const sections = groupLinesIntoSections(lines);

    // Extract resume data from sections
    const resumeData = extractResumeFromSections(sections);

    // Output the parsed resume data as JSON
    console.log(JSON.stringify(resumeData, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      error: 'Resume parsing failed: ' + (error instanceof Error ? error.message : String(error))
    }));
    process.exit(1);
  }
}

parseResume();