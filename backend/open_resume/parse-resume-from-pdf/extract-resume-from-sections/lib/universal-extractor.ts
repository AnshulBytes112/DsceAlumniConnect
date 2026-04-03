import type { ResumeSectionToLines, Lines, TextItem } from "../../types";
import { detectSectionType } from "./enhanced-section-detector";
import { divideSectionIntoSubsections } from "./subsections";
import { getBulletPointsFromLines, getDescriptionsLineIdx } from "./bullet-points";

/**
 * Universal section extractor that can handle any section type
 * by analyzing content patterns and extracting meaningful information
 */
export interface UniversalSection {
  title: string;
  type: string;
  confidence: number;
  content: string[];
  subsections?: Array<{
    title: string;
    content: string[];
  }>;
}

/**
 * Extract structured information from any section type
 */
export const extractUniversalSection = (
  sectionName: string,
  lines: Lines
): UniversalSection => {
  const detection = detectSectionType(sectionName, lines);
  
  // Get all text content
  const allText = lines
    .flat()
    .map(item => item.text.trim())
    .filter(text => text.length > 0);
  
  // Try to divide into subsections if it looks like a multi-item section
  const subsections = divideIntoSubsectionsSafe(lines);
  
  return {
    title: sectionName,
    type: detection.type,
    confidence: detection.confidence,
    content: allText,
    subsections: subsections.length > 1 ? subsections : undefined
  };
};

/**
 * Safe subsection division that handles various formats
 */
const divideIntoSubsectionsSafe = (lines: Lines): Array<{ title: string; content: string[] }> => {
  try {
    const subsections = divideSectionIntoSubsections(lines);
    
    return subsections.map(subsection => {
      const descriptionsLineIdx = getDescriptionsLineIdx(subsection) ?? 1;
      const headerLines = subsection.slice(0, descriptionsLineIdx);
      const contentLines = subsection.slice(descriptionsLineIdx);
      
      const title = headerLines
        .flat()
        .map(item => item.text)
        .join(' ')
        .trim();
      
      const content = contentLines.length > 0 
        ? getBulletPointsFromLines(contentLines)
        : headerLines.slice(1).flat().map(item => item.text).filter(text => text.trim());
      
      return {
        title: title || 'Untitled',
        content
      };
    });
  } catch {
    // Fallback: treat entire section as one subsection
    const allText = lines
      .flat()
      .map(item => item.text.trim())
      .filter(text => text.length > 0);
    
    return [{
      title: lines[0]?.flat().map(item => item.text).join(' ').trim() || 'Content',
      content: allText
    }];
  }
};

/**
 * Extract all sections with universal detection
 */
export const extractAllSectionsUniversal = (
  sections: ResumeSectionToLines
): UniversalSection[] => {
  const extractedSections: UniversalSection[] = [];
  
  for (const [sectionName, lines] of Object.entries(sections)) {
    if (!lines || lines.length === 0) continue;
    
    const universalSection = extractUniversalSection(sectionName, lines);
    extractedSections.push(universalSection);
  }
  
  // Sort by confidence and type priority
  return extractedSections.sort((a, b) => {
    // First by type priority (known types first)
    const typePriority = { work: 5, education: 4, project: 3, skill: 2, profile: 1 };
    const aPriority = typePriority[a.type as keyof typeof typePriority] || 0;
    const bPriority = typePriority[b.type as keyof typeof typePriority] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Then by confidence
    return b.confidence - a.confidence;
  });
};

/**
 * Get sections by type with fallback to universal extraction
 */
export const getSectionsByTypeWithFallback = (
  sections: ResumeSectionToLines,
  targetType: string
): UniversalSection[] => {
  const allSections = extractAllSectionsUniversal(sections);
  
  return allSections.filter(section => 
    section.type === targetType || 
    section.title.toLowerCase().includes(targetType.toLowerCase())
  );
};
