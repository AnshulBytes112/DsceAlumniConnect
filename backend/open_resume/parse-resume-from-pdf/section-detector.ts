import type { ResumeKey } from "../lib/redux/types";
import type { Line, Lines, ResumeSectionToLines } from "./types";

export const PROFILE_SECTION: ResumeKey = "profile";

export interface SectionDetectionOptions {
  enableFallbackDetection: boolean;
  enableKeywordBoosting: boolean;
  minConfidenceThreshold: number;
}

const DEFAULT_OPTIONS: SectionDetectionOptions = {
  enableFallbackDetection: true,
  enableKeywordBoosting: true,
  minConfidenceThreshold: 0.5,
};

interface SectionCandidate {
  name: string;
  lineIndex: number;
  confidence: number;
  matchedKeywords: string[];
}

const PRIMARY_SECTION_KEYWORDS = [
  'experience', 'education', 'project', 'skill', 'skills',
  'work', 'employment', 'history', 'professional',
];

const SECONDARY_SECTION_KEYWORDS = [
  'job', 'career', 'internship', 'internships',
  'course', 'courses', 'academic', 'training',
  'certification', 'certifications', 'license', 'licenses',
  'achievement', 'achievements', 'award', 'awards', 'honor', 'honors',
  'extracurricular', 'extra-curricular', 'activity', 'activities',
  'objective', 'summary', 'profile', 'about',
  'language', 'languages', 'interest', 'interests', 'hobby', 'hobbies',
  'reference', 'references', 'publication', 'publications',
  'volunteer', 'volunteering', 'leadership',
];

const ALL_SECTION_KEYWORDS = [...PRIMARY_SECTION_KEYWORDS, ...SECONDARY_SECTION_KEYWORDS];

const normalizeSectionName = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 1)
    .join(' ');
};

const isBold = (item: { bold?: boolean }): boolean => item.bold === true;

const hasOnlyLettersSpacesAmpersands = (text: string): boolean => 
  /^[A-Za-z\s&]+$/.test(text);

const hasLetterAndIsAllUpperCase = (text: string): boolean => 
  /[A-Z]/.test(text) && text === text.toUpperCase();

const hasAtMostTwoWords = (text: string): boolean =>
  text.split(/\s/).filter(s => s !== '&').length <= 2;

const startsWithCapital = (text: string): boolean => /[A-Z]/.test(text[0] || '');

const calculateSectionConfidence = (
  text: string,
  isBoldText: boolean,
  isAllCaps: boolean,
  matchedKeywords: string[]
): number => {
  let confidence = 0;
  
  if (isBoldText && isAllCaps) {
    confidence += 0.6;
  } else if (isBoldText) {
    confidence += 0.3;
  } else if (isAllCaps) {
    confidence += 0.2;
  }
  
  const lowerText = text.toLowerCase();
  const primaryMatches = matchedKeywords.filter(kw => 
    PRIMARY_SECTION_KEYWORDS.includes(kw)
  ).length;
  const secondaryMatches = matchedKeywords.filter(kw =>
    SECONDARY_SECTION_KEYWORDS.includes(kw)
  ).length;
  
  confidence += primaryMatches * 0.2;
  confidence += secondaryMatches * 0.1;
  
  if (hasAtMostTwoWords(text)) confidence += 0.1;
  if (startsWithCapital(text)) confidence += 0.1;
  if (hasOnlyLettersSpacesAmpersands(text)) confidence += 0.1;
  
  return Math.min(confidence, 1);
};

const findSectionKeywords = (text: string): string[] => {
  const normalized = normalizeSectionName(text);
  return ALL_SECTION_KEYWORDS.filter(kw => normalized.includes(kw));
};

const isSectionTitleLine = (
  line: Line,
  lineIndex: number,
  totalLines: number,
  options: SectionDetectionOptions
): { isSection: boolean; confidence: number; sectionName: string; keywords: string[] } => {
  const isFirstTwoLines = lineIndex < 2;
  const hasMultipleItems = line.length > 1;
  const hasNoItems = line.length === 0;
  
  if (isFirstTwoLines || hasMultipleItems || hasNoItems) {
    return { isSection: false, confidence: 0, sectionName: '', keywords: [] };
  }
  
  const textItem = line[0];
  const text = textItem.text.trim();
  const bold = isBold(textItem);
  const allCaps = hasLetterAndIsAllUpperCase(text);
  
  const keywords = findSectionKeywords(text);
  const confidence = calculateSectionConfidence(text, bold, allCaps, keywords);
  
  const isPrimarySection = keywords.some(kw => PRIMARY_SECTION_KEYWORDS.includes(kw));
  const meetsThreshold = confidence >= options.minConfidenceThreshold || isPrimarySection;
  
  if (bold && allCaps && meetsThreshold) {
    return { isSection: true, confidence, sectionName: text, keywords };
  }
  
  if (options.enableKeywordBoosting && keywords.length > 0 && meetsThreshold) {
    if (hasAtMostTwoWords(text) && hasOnlyLettersSpacesAmpersands(text) && startsWithCapital(text)) {
      return { isSection: true, confidence, sectionName: text, keywords };
    }
  }
  
  return { isSection: false, confidence: 0, sectionName: '', keywords: [] };
};

const groupLinesWithFallback = (
  lines: Lines,
  options: SectionDetectionOptions
): Map<string, Lines> => {
  const sections = new Map<string, Lines>();
  let currentSection: string = PROFILE_SECTION;
  let currentLines: Lines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const detection = isSectionTitleLine(line, i, lines.length, options);
    
    if (detection.isSection) {
      if (currentLines.length > 0) {
        sections.set(currentSection, [...currentLines]);
        currentLines = [];
      }
      currentSection = detection.sectionName;
    } else {
      currentLines.push(line);
    }
  }
  
  if (currentLines.length > 0) {
    sections.set(currentSection, [...currentLines]);
  }
  
  if (options.enableFallbackDetection && sections.size <= 1) {
    return fallbackSectionDetection(lines);
  }
  
  return sections;
};

const fallbackSectionDetection = (lines: Lines): Map<string, Lines> => {
  const sections = new Map<string, Lines>();
  
  const lineTexts = lines.map(l => l.map(i => i.text).join(' ').toLowerCase());
  
  const sectionBoundaries: Array<{ index: number; sectionName: string }> = [];
  
  const keywordPatterns: Array<{ keywords: string[]; sectionName: string }> = [
    { keywords: ['experience', 'employment', 'history', 'work'], sectionName: 'Experience' },
    { keywords: ['education', 'academic', 'university', 'college', 'school'], sectionName: 'Education' },
    { keywords: ['project'], sectionName: 'Projects' },
    { keywords: ['skill', 'skills', 'technology', 'technologies'], sectionName: 'Skills' },
    { keywords: ['certification', 'certifications', 'certificate'], sectionName: 'Certifications' },
    { keywords: ['achievement', 'achievements', 'award', 'awards'], sectionName: 'Achievements' },
    { keywords: ['objective', 'summary', 'profile'], sectionName: 'Summary' },
  ];
  
  for (let i = 0; i < lineTexts.length; i++) {
    const text = lineTexts[i];
    for (const pattern of keywordPatterns) {
      if (pattern.keywords.some(kw => text.includes(kw)) && i < lineTexts.length - 2) {
        sectionBoundaries.push({ index: i, sectionName: pattern.sectionName });
        break;
      }
    }
  }
  
  sectionBoundaries.sort((a, b) => a.index - b.index);
  
  if (sectionBoundaries.length === 0) {
    sections.set(PROFILE_SECTION, lines);
    return sections;
  }
  
  let currentSection: string = PROFILE_SECTION;
  let startIdx = 0;
  
  for (const boundary of sectionBoundaries) {
    if (boundary.index > startIdx) {
      sections.set(currentSection, lines.slice(startIdx, boundary.index));
    }
    currentSection = boundary.sectionName;
    startIdx = boundary.index;
  }
  
  if (startIdx < lines.length) {
    sections.set(currentSection, lines.slice(startIdx));
  }
  
  return sections;
};

export const groupLinesIntoSections = (
  lines: Lines,
  options: Partial<SectionDetectionOptions> = {}
): ResumeSectionToLines => {
  const mergedOptions: SectionDetectionOptions = { ...DEFAULT_OPTIONS, ...options };
  const sections = groupLinesWithFallback(lines, mergedOptions);
  return Object.fromEntries(sections) as ResumeSectionToLines;
};

export const detectResumeFormat = (sections: ResumeSectionToLines): {
  format: 'standard' | 'compact' | 'modern' | 'unknown';
  sectionCount: number;
  missingSections: string[];
} => {
  const detectedSections = Object.keys(sections).filter(k => k !== PROFILE_SECTION);
  const requiredSections = ['experience', 'education', 'skills'];
  
  const missingSections = requiredSections.filter(
    req => !detectedSections.some(d => d.toLowerCase().includes(req))
  );
  
  let format: 'standard' | 'compact' | 'modern' | 'unknown' = 'standard';
  
  if (sections[PROFILE_SECTION]?.length === 0 || 
      (sections[PROFILE_SECTION]?.length || 0) < 3) {
    format = 'compact';
  } else if (detectedSections.length > 6) {
    format = 'modern';
  }
  
  return {
    format,
    sectionCount: detectedSections.length,
    missingSections,
  };
};
