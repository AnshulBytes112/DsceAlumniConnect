import type { ResumeSectionToLines, Lines } from "../../types";

/**
 * Parser error types for better error handling
 */
export type ParserErrorType = 
  | 'EMPTY_SECTIONS'
  | 'MALFORMED_DATA'
  | 'EXTRACTION_FAILED'
  | 'INVALID_FORMAT'
  | 'MISSING_REQUIRED_FIELD';

export interface ParserError {
  type: ParserErrorType;
  message: string;
  sectionName?: string;
  details?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ParserError[];
  warnings: string[];
}

/**
 * Validates resume sections before processing
 */
export const validateSections = (sections: ResumeSectionToLines): ValidationResult => {
  const errors: ParserError[] = [];
  const warnings: string[] = [];
  
  // Check if sections is empty or null
  if (!sections || Object.keys(sections).length === 0) {
    errors.push({
      type: 'EMPTY_SECTIONS',
      message: 'No sections provided for parsing'
    });
    return { valid: false, errors, warnings };
  }
  
  // Validate each section
  for (const [sectionName, lines] of Object.entries(sections)) {
    if (!lines) {
      warnings.push(`Section "${sectionName}" has no content`);
      continue;
    }
    
    if (!Array.isArray(lines)) {
      errors.push({
        type: 'MALFORMED_DATA',
        message: `Section "${sectionName}" has invalid format`,
        sectionName,
        details: 'Expected array of lines'
      });
      continue;
    }
    
    if (lines.length === 0) {
      warnings.push(`Section "${sectionName}" is empty`);
      continue;
    }
    
    // Check for malformed lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!Array.isArray(line)) {
        errors.push({
          type: 'MALFORMED_DATA',
          message: `Section "${sectionName}", line ${i} has invalid format`,
          sectionName,
          details: 'Line should be an array of text items'
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Safe section extraction with error handling
 */
export const safeExtractSections = <T>(
  sections: ResumeSectionToLines,
  extractor: (sections: ResumeSectionToLines) => T
): { result?: T; error?: ParserError; success: boolean } => {
  try {
    // Validate first
    const validation = validateSections(sections);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors[0]
      };
    }
    
    // Run extraction
    const result = extractor(sections);
    
    return {
      success: true,
      result
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'EXTRACTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown extraction error',
        details: error
      }
    };
  }
};

/**
 * Error recovery strategies for different error types
 */
export const recoverFromError = (
  sections: ResumeSectionToLines,
  error: ParserError
): ResumeSectionToLines | null => {
  switch (error.type) {
    case 'EMPTY_SECTIONS':
      return null;
      
    case 'MALFORMED_DATA':
      // Try to clean up malformed data
      const cleaned: ResumeSectionToLines = {};
      for (const [name, lines] of Object.entries(sections)) {
        if (!lines || !Array.isArray(lines)) continue;
        
        cleaned[name] = lines.filter(line => 
          Array.isArray(line) && line.length > 0
        );
        
        if (cleaned[name].length === 0) {
          delete cleaned[name];
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
      
    case 'INVALID_FORMAT':
      // Attempt to reformat
      return sections;
      
    default:
      return null;
  }
};

/**
 * Retry extraction with recovery
 */
export const retryWithRecovery = <T>(
  sections: ResumeSectionToLines,
  extractor: (sections: ResumeSectionToLines) => T,
  maxRetries: number = 2
): { result?: T; errors: ParserError[]; success: boolean } => {
  const errors: ParserError[] = [];
  let currentSections = sections;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { success, result, error } = safeExtractSections(currentSections, extractor);
    
    if (success && result) {
      return { success: true, result, errors };
    }
    
    if (error) {
      errors.push(error);
      
      // Try to recover
      const recovered = recoverFromError(currentSections, error);
      if (recovered) {
        currentSections = recovered;
      } else {
        break; // Can't recover
      }
    }
  }
  
  return { success: false, errors };
};

/**
 * Validates extracted resume data
 */
export const validateExtractedResume = (resume: any): ValidationResult => {
  const errors: ParserError[] = [];
  const warnings: string[] = [];
  
  if (!resume) {
    errors.push({
      type: 'EXTRACTION_FAILED',
      message: 'Resume extraction returned null or undefined'
    });
    return { valid: false, errors, warnings };
  }
  
  // Check required fields
  const requiredFields = ['profile', 'educations', 'workExperiences', 'projects', 'skills'];
  
  for (const field of requiredFields) {
    if (!(field in resume)) {
      warnings.push(`Missing field: ${field}`);
    }
  }
  
  // Validate arrays
  const arrayFields = ['educations', 'workExperiences', 'projects'];
  
  for (const field of arrayFields) {
    if (resume[field] && !Array.isArray(resume[field])) {
      errors.push({
        type: 'INVALID_FORMAT',
        message: `Field "${field}" should be an array`,
        details: resume[field]
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};
