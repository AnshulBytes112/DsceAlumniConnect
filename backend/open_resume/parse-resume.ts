/**
 * TypeScript script to parse resume from PDF using open-resume parser
 * This script is called from Java backend
 * 
 * Usage: tsx parse-resume.ts <pdf-file-path> [options]
 * Output: JSON string with parsed resume data
 * 
 * Options:
 *   --no-cache     Disable result caching
 *   --verbose      Enable debug output
 * 
 * Note: This script must be run from the open-resume directory root
 * with tsconfig.json path mappings configured
 */

import { parseResumeFromPdf, parseResumeFromPdfWithTimeout, invalidateCache } from "./parse-resume-from-pdf/parse-resume-optimized";

interface ParseOptions {
  enableCache: boolean;
  timeout: number;
  verbose: boolean;
}

const parseArgs = (args: string[]): { filePath: string; options: ParseOptions } => {
  const options: ParseOptions = {
    enableCache: true,
    timeout: 30000,
    verbose: false,
  };

  const argsCopy = [...args];
  const filePath = argsCopy.find(arg => !arg.startsWith('--'));
  const flags = argsCopy.filter(arg => arg.startsWith('--'));

  for (const flag of flags) {
    switch (flag) {
      case '--no-cache':
        options.enableCache = false;
        break;
      case '--verbose':
        options.verbose = true;
        process.env.DEBUG_RESUME_PARSER = 'true';
        break;
      case '--clear-cache':
        invalidateCache();
        break;
      default:
        if (flag.startsWith('--timeout=')) {
          options.timeout = parseInt(flag.split('=')[1], 10) || 30000;
        }
    }
  }

  return { filePath: filePath || '', options };
};

async function main() {
  const { filePath, options } = parseArgs(process.argv.slice(2));

  if (!filePath) {
    const error = {
      success: false,
      error: {
        code: 'INVALID_ARGS',
        message: 'Usage: tsx parse-resume.ts <pdf-file-path> [--no-cache] [--verbose] [--timeout=ms]',
      },
    };
    console.error(JSON.stringify(error));
    process.exit(1);
  }

  try {
    const path = require('path');
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    const fileUrl = `file://${absolutePath}`;

    if (options.verbose) {
      console.error(`[Parser] Starting parse for: ${absolutePath}`);
      console.error(`[Parser] Options:`, options);
    }

    const result = await parseResumeFromPdfWithTimeout(fileUrl, {
      enableCache: options.enableCache,
      timeout: options.timeout,
    });

    if (result.success) {
      if (options.verbose) {
        console.error(`[Parser] Success! Parse time: ${result.metadata?.parseTimeMs}ms`);
        console.error(`[Parser] Format: ${result.metadata?.format}`);
        console.error(`[Parser] Sections: ${result.metadata?.sectionCount}`);
        console.error(`[Parser] Cached: ${result.metadata?.cached}`);
      }
      
      // Output the raw resume data for Java backend compatibility
      // (Java expects flat JSON structure without wrapper)
      console.log(JSON.stringify(result.data));
    } else {
      if (options.verbose) {
        console.error(`[Parser] Error: ${result.error?.message}`);
        console.error(`[Parser] Code: ${result.error?.code}`);
      }
      
      // For errors, output in error format
      console.error(JSON.stringify({
        error: {
          code: result.error?.code || 'UNKNOWN_ERROR',
          message: result.error?.message || 'Unknown error occurred',
        },
      }));
      process.exit(1);
    }
  } catch (error: any) {
    const errorObj = {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    };
    console.error(JSON.stringify(errorObj));
    process.exit(1);
  }
}

main();

