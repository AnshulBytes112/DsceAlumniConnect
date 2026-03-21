import type { Resume } from "../lib/redux/types";
import type { TextItems } from "./types";
import { readPdf, validatePdf } from "./read-pdf-optimized";
import { groupTextItemsIntoLines } from "./group-text-items-into-lines";
import { groupLinesIntoSections } from "./section-detector";
import { extractResumeFromSections } from "./extract-resume-from-sections";
import { parserCache, ResumeParserCache } from "./utils/cache";
import {
  ParserError,
  ParserErrorCode,
  ParseResult,
  ParseMetadata,
  createSuccessResult,
  createErrorResult,
  debug,
  warn,
} from "./utils/error-handling";
import { detectResumeFormat } from "./section-detector";

export type { ParseResult, ParseMetadata } from "./utils/error-handling";

export interface ParserOptions {
  enableCache?: boolean;
  enableParallelProcessing?: boolean;
  minConfidenceThreshold?: number;
  timeout?: number;
  cache?: ResumeParserCache;
}

const DEFAULT_OPTIONS: Required<ParserOptions> = {
  enableCache: true,
  enableParallelProcessing: true,
  minConfidenceThreshold: 0.5,
  timeout: 30000,
  cache: parserCache,
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new ParserError(
        `Parsing timeout after ${timeoutMs}ms`,
        ParserErrorCode.TIMEOUT,
        false,
        { timeoutMs }
      )), timeoutMs)
    ),
  ]);
};

const validateFileUrl = (fileUrl: string): void => {
  if (!fileUrl) {
    throw new ParserError(
      'File URL is required',
      ParserErrorCode.FILE_NOT_FOUND,
      false,
      { fileUrl }
    );
  }
  
  if (typeof fileUrl !== 'string') {
    throw new ParserError(
      'File URL must be a string',
      ParserErrorCode.INVALID_PDF,
      false,
      { fileUrl: typeof fileUrl }
    );
  }
};

export const parseResumeFromPdf = async (
  fileUrl: string,
  options: ParserOptions = {}
): Promise<ParseResult<Resume>> => {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];
  
  try {
    validateFileUrl(fileUrl);
    
    debug('Starting resume parsing');
    
    if (mergedOptions.enableCache) {
      const cached = mergedOptions.cache.get(fileUrl);
      if (cached) {
        debug('Cache hit for resume', { fileUrl });
        return createSuccessResult(cached, {
          parseTimeMs: Date.now() - startTime,
          confidence: 1.0,
          cached: true,
        }, ['Result served from cache']);
      }
    }
    
    const validation = await validatePdf(fileUrl);
    if (!validation.valid) {
      throw new ParserError(
        validation.error || 'Invalid PDF',
        ParserErrorCode.INVALID_PDF,
        false,
        { fileUrl }
      );
    }
    
    debug('PDF validated successfully', { pageCount: validation.pageCount });
    
    let textItems: TextItems;
    try {
      textItems = await readPdf(fileUrl);
    } catch (error) {
      throw new ParserError(
        error instanceof Error ? error.message : 'PDF parse failed',
        ParserErrorCode.PDF_PARSE_ERROR,
        false,
        { fileUrl }
      );
    }
    
    if (textItems.length === 0) {
      throw new ParserError(
        'PDF contains no extractable text. It might be a scanned/image-based PDF.',
        ParserErrorCode.EMPTY_PDF,
        false,
        { fileUrl }
      );
    }
    
    debug('PDF read successfully', { textItemCount: textItems.length });
    
    const lines = groupTextItemsIntoLines(textItems);
    debug('Text items grouped into lines', { lineCount: lines.length });
    
    const sections = groupLinesIntoSections(lines, {
      minConfidenceThreshold: mergedOptions.minConfidenceThreshold,
      enableFallbackDetection: true,
      enableKeywordBoosting: true,
    });
    
    const formatInfo = detectResumeFormat(sections);
    debug('Resume format detected', formatInfo);
    
    if (formatInfo.missingSections.length > 0) {
      warnings.push(
        `Potentially missing sections detected: ${formatInfo.missingSections.join(', ')}`
      );
    }
    
    let resume: Resume;
    try {
      resume = extractResumeFromSections(sections);
    } catch (error) {
      throw new ParserError(
        error instanceof Error ? error.message : 'Extraction failed',
        ParserErrorCode.EXTRACTION_FAILED,
        false,
        { fileUrl }
      );
    }
    
    const parseTimeMs = Date.now() - startTime;
    
    if (mergedOptions.enableCache) {
      mergedOptions.cache.set(fileUrl, resume);
    }
    
    const metadata: ParseMetadata = {
      parseTimeMs,
      pageCount: validation.pageCount || 1,
      format: formatInfo.format,
      sectionCount: formatInfo.sectionCount,
      cached: false,
      missingSections: formatInfo.missingSections,
      confidence: 1.0,
    };
    
    debug('Resume parsing completed');
    
    return createSuccessResult(resume, metadata, warnings.length > 0 ? warnings : undefined);
    
  } catch (error) {
    if (error instanceof ParserError) {
      warn(`Parser error: ${error.message}`, { code: error.code });
      return createErrorResult(error);
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    warn(`Unexpected error during parsing: ${message}`);
    
    return createErrorResult(new ParserError(
      message,
      ParserErrorCode.UNKNOWN_ERROR,
      false,
      { originalError: String(error) }
    ));
  }
};

export const parseResumeFromPdfWithTimeout = async (
  fileUrl: string,
  options: ParserOptions = {}
): Promise<ParseResult<Resume>> => {
  const timeout = options.timeout ?? DEFAULT_OPTIONS.timeout;
  
  try {
    return await withTimeout(parseResumeFromPdf(fileUrl, options), timeout);
  } catch (error) {
    if (error instanceof ParserError) {
      return createErrorResult(error);
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResult(new ParserError(
      message,
      ParserErrorCode.TIMEOUT,
      false,
      { timeout }
    ));
  }
};

export const parseMultipleResumes = async (
  fileUrls: string[],
  options: ParserOptions = {}
): Promise<Map<string, ParseResult<Resume>>> => {
  const results = new Map<string, ParseResult<Resume>>();
  
  const parsePromises = fileUrls.map(async (url) => {
    const result = await parseResumeFromPdf(url, options);
    return { url, result };
  });
  
  const settled = await Promise.allSettled(parsePromises);
  
  settled.forEach((outcome, index) => {
    const url = fileUrls[index];
    if (outcome.status === 'fulfilled') {
      results.set(url, outcome.value.result);
    } else {
      results.set(url, createErrorResult(new ParserError(
        outcome.reason?.message || 'Failed to parse',
        ParserErrorCode.UNKNOWN_ERROR,
        false
      )));
    }
  });
  
  return results;
};

export const invalidateCache = (fileUrl?: string): void => {
  if (fileUrl) {
    parserCache.invalidate(fileUrl);
  } else {
    parserCache.clear();
  }
};

export const getCacheStats = () => parserCache.getStats();
