import type { ResumeSectionToLines, Lines } from "../../types";
import { classifyAndReorganizeSections, detectSectionsByContent } from "./enhanced-section-detector";

/**
 * Enhanced version of getSectionLinesByKeywords that uses multiple detection strategies
 */
export const getSectionLinesByKeywordsEnhanced = (
  sections: ResumeSectionToLines,
  keywords: string[],
  useEnhancedDetection: boolean = true
): Lines => {
  if (!useEnhancedDetection) {
    // Fallback to original simple logic
    for (const sectionName in sections) {
      const hasKeyword = keywords.some((keyword) =>
        sectionName.toLowerCase().includes(keyword)
      );
      if (hasKeyword) {
        return sections[sectionName];
      }
    }
    return [];
  }

  // First try original approach - preserve section names when they're already correct
  for (const sectionName in sections) {
    const hasKeyword = keywords.some((keyword) =>
      sectionName.toLowerCase().includes(keyword)
    );
    if (hasKeyword) {
      return sections[sectionName];
    }
  }

  const reorganizedSections = classifyAndReorganizeSections(sections);
  
  for (const keyword of keywords) {
    if (reorganizedSections[keyword]) {
      return reorganizedSections[keyword];
    }
  }
  
  for (const [sectionName, lines] of Object.entries(reorganizedSections)) {
    const hasKeyword = keywords.some((keyword) =>
      sectionName.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      return lines;
    }
  }
  
  return [];
};

/**
 * Get all sections with their detected types and confidence scores
 */
export const getAllSectionsWithDetection = (
  sections: ResumeSectionToLines
): Array<{ name: string; lines: Lines; detectedType: string; confidence: number }> => {
  const reorganizedSections = classifyAndReorganizeSections(sections);
  const result: Array<{ name: string; lines: Lines; detectedType: string; confidence: number }> = [];
  
  for (const [sectionName, lines] of Object.entries(reorganizedSections)) {
    // For reorganized sections, the section name is already the detected type
    result.push({
      name: sectionName,
      lines,
      detectedType: sectionName,
      confidence: sectionName in sections ? 5 : 3 // Higher confidence for original sections
    });
  }
  
  return result;
};

/**
 * Get sections by content analysis when section names are unclear
 */
export const getSectionsByContentAnalysis = (
  sections: ResumeSectionToLines
): ResumeSectionToLines => {
  return detectSectionsByContent(sections);
};

/**
 * Hybrid approach that combines keyword matching with content analysis
 */
export const getSectionLinesHybrid = (
  sections: ResumeSectionToLines,
  keywords: string[]
): Lines => {
  // First try enhanced keyword matching
  const keywordResult = getSectionLinesByKeywordsEnhanced(sections, keywords, true);
  if (keywordResult.length > 0) {
    return keywordResult;
  }
  
  // If no results, try content analysis
  const contentAnalyzed = getSectionsByContentAnalysis(sections);
  
  for (const keyword of keywords) {
    if (contentAnalyzed[keyword]) {
      return contentAnalyzed[keyword];
    }
  }
  
  return [];
};
