export class ParserError extends Error {
  constructor(
    message: string,
    public code: ParserErrorCode,
    public recoverable: boolean = false,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ParserError';
  }
}

export enum ParserErrorCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_PDF = 'INVALID_PDF',
  PDF_PARSE_ERROR = 'PDF_PARSE_ERROR',
  EMPTY_PDF = 'EMPTY_PDF',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  SECTION_DETECTION_FAILED = 'SECTION_DETECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ParseMetadata {
  parseTimeMs: number;
  confidence?: number;
  format?: string;
  pageCount?: number;
  sectionCount?: number;
  cached?: boolean;
  missingSections?: string[];
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: ParserError;
  warnings?: string[];
  metadata?: ParseMetadata;
}

export const createSuccessResult = <T>(
  data: T,
  metadata?: ParseMetadata,
  warnings?: string[]
): ParseResult<T> => ({
  success: true,
  data,
  metadata,
  warnings,
});

export const createErrorResult = <T>(
  error: ParserError
): ParseResult<T> => ({
  success: false,
  error,
});

export const withErrorHandling = <T>(
  fn: () => T,
  errorCode: ParserErrorCode,
  context?: Record<string, unknown>
): T => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof ParserError) throw error;
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new ParserError(
      message,
      errorCode,
      errorCode === ParserErrorCode.EXTRACTION_FAILED ||
      errorCode === ParserErrorCode.SECTION_DETECTION_FAILED,
      context
    );
  }
};

export const withAsyncErrorHandling = <T>(
  fn: () => Promise<T>,
  errorCode: ParserErrorCode,
  context?: Record<string, unknown>
): Promise<T> => {
  return fn().catch((error) => {
    if (error instanceof ParserError) throw error;
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new ParserError(
      message,
      errorCode,
      errorCode === ParserErrorCode.EXTRACTION_FAILED ||
      errorCode === ParserErrorCode.SECTION_DETECTION_FAILED,
      context
    );
  });
};

export const warn = (message: string, context?: Record<string, unknown>): void => {
  console.warn(`[ResumeParser Warning] ${message}`, context || '');
};

export const debug = (message: string, context?: Record<string, unknown>): void => {
  if (process.env.DEBUG_RESUME_PARSER) {
    console.debug(`[ResumeParser Debug] ${message}`, context || '');
  }
};

export const logError = (error: Error, context?: Record<string, unknown>): void => {
  console.error(`[ResumeParser Error] ${error.message}`, {
    stack: error.stack,
    ...context,
  });
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 100
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
