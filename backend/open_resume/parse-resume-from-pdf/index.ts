import { readPdf } from "./read-pdf";
import { groupTextItemsIntoLines } from "./group-text-items-into-lines";
import { groupLinesIntoSections } from "./group-lines-into-sections";
import { extractResumeFromSections } from "./extract-resume-from-sections";
import { parseResumeFromPdf as parseResumeOptimized, type ParserOptions, type ParseResult } from "./parse-resume-optimized";
import { parseDateRange, formatDateRange, type ParsedDateRange } from "./utils/date-parser";
import { 
  ParserError, 
  ParserErrorCode, 
  type ParseResult as ParserResult, 
  createSuccessResult, 
  createErrorResult 
} from "./utils/error-handling";
import type { Resume } from "../lib/redux/types";

export { validatePdf, readPdfMetadata } from "./read-pdf-optimized";
export { groupLinesIntoSections, detectResumeFormat, type SectionDetectionOptions } from "./section-detector";
export { parserCache, type ResumeParserCache } from "./utils/cache";
export { 
  ParserError, 
  ParserErrorCode, 
  type ParseResult as ParserResult, 
  createSuccessResult, 
  createErrorResult
} from "./utils/error-handling";
export { parseDateRange, formatDateRange, type ParsedDateRange } from "./utils/date-parser";

export { parseResumeFromPdfWithTimeout, parseMultipleResumes, invalidateCache, getCacheStats } from "./parse-resume-optimized";

export interface ResumeParserResult extends ParseResult<Resume> {}

const parseResumeFromPdf = async (fileUrl: string): Promise<Resume> => {
  const result = await parseResumeOptimized(fileUrl);
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to parse resume');
  }
  return result.data;
};

export { parseResumeFromPdf, type ParserOptions };

export { readPdf, groupTextItemsIntoLines, extractResumeFromSections };
