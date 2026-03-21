import type { ResumeSectionToLines, Lines, Line, TextItem } from "../../types";

// Enhanced section detection with fuzzy matching and contextual analysis
export interface SectionPattern {
  name: string;
  keywords: string[];
  patterns: RegExp[];
  contextKeywords: string[];
  priority: number;
}

export const SECTION_PATTERNS: SectionPattern[] = [
  {
    name: "work",
    keywords: ["work", "experience", "employment", "history", "job", "professional", "career", "internship"],
    patterns: [
      /^(work|professional)\s+(experience|history)$/i,
      /^(employment|career)\s+(history|summary)$/i,
      /^internship(s)?$/i,
      /^(professional\s+)?experience$/i
    ],
    contextKeywords: ["company", "position", "role", "duration", "responsibilities", "achievements"],
    priority: 10
  },
  {
    name: "education",
    keywords: ["education", "academic", "qualification", "degree", "university", "college", "school"],
    patterns: [
      /^education$/i,
      /^(academic|education)\s+(background|history|qualification)s?$/i,
      /^(university|college)\s+(education|studies)$/i,
      /^degree(s)?$/i
    ],
    contextKeywords: ["university", "college", "degree", "bachelor", "master", "phd", "gpa", "graduation"],
    priority: 10
  },
  {
    name: "project",
    keywords: ["project", "portfolio", "work", "development", "research"],
    patterns: [
      /^project(s)?$/i,
      /^(personal|academic|professional)\s+project(s)?$/i,
      /^(research|development)\s+project(s)?$/i,
      /^portfolio$/i
    ],
    contextKeywords: ["built", "developed", "created", "implemented", "designed", "technologies", "tools"],
    priority: 9
  },
  {
    name: "skill",
    keywords: ["skill", "technical", "technology", "expertise", "competency", "proficiency"],
    patterns: [
      /^skill(s)?$/i,
      /^(technical|technology)\s+skill(s)?$/i,
      /^expertise$/i,
      /^competenc(y|ies)$/i,
      /^proficienc(y|ies)$/i
    ],
    contextKeywords: ["programming", "language", "framework", "library", "tool", "software", "technology"],
    priority: 8
  },
  {
    name: "profile",
    keywords: ["profile", "summary", "objective", "about", "introduction", "overview"],
    patterns: [
      /^(professional\s+)?(profile|summary)$/i,
      /^(career\s+)?objective$/i,
      /^about\s+(me|myself)$/i,
      /^(personal|professional)\s+(introduction|overview)$/i
    ],
    contextKeywords: ["experienced", "skilled", "passionate", "dedicated", "professional", "background"],
    priority: 7
  }
];

/**
 * Calculate similarity between two strings using Jaccard similarity
 */
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Check if a line contains contextual keywords for a section
 */
const hasContextualKeywords = (lines: Lines, keywords: string[]): number => {
  let score = 0;
  const allText = lines.flat().map(item => item.text.toLowerCase()).join(' ');
  
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = allText.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  
  return score;
};

/**
 * Enhanced section detection using multiple strategies
 */
export const detectSectionType = (sectionName: string, lines: Lines): { type: string; confidence: number } => {
  const normalizedName = sectionName.toLowerCase().trim();
  
  let bestMatch = { type: 'unknown', confidence: 0 };
  
  for (const pattern of SECTION_PATTERNS) {
    let confidence = 0;
    
    // 1. Exact keyword match
    for (const keyword of pattern.keywords) {
      if (normalizedName.includes(keyword)) {
        confidence += 3;
      }
    }
    
    // 2. Pattern matching
    for (const regex of pattern.patterns) {
      if (regex.test(normalizedName)) {
        confidence += 5;
      }
    }
    
    // 3. String similarity
    for (const keyword of pattern.keywords) {
      const similarity = calculateStringSimilarity(normalizedName, keyword);
      if (similarity > 0.7) {
        confidence += similarity * 2;
      }
    }
    
    // 4. Contextual analysis
    const contextScore = hasContextualKeywords(lines, pattern.contextKeywords);
    if (contextScore > 0) {
      confidence += Math.min(contextScore, 3);
    }
    
    // 5. Priority boost
    confidence += pattern.priority * 0.1;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { type: pattern.name, confidence };
    }
  }
  
  return bestMatch;
};

/**
 * Enhanced section classifier that reorganizes sections based on content analysis
 */
export const classifyAndReorganizeSections = (sections: ResumeSectionToLines): ResumeSectionToLines => {
  const reorganized: ResumeSectionToLines = {};
  const unclassified: ResumeSectionToLines = {};
  
  // Classify each section
  for (const [sectionName, lines] of Object.entries(sections)) {
    if (!lines || lines.length === 0) continue;
    
    const detection = detectSectionType(sectionName, lines);
    
    if (detection.confidence > 2) {
      // High confidence - assign to detected type
      if (!reorganized[detection.type]) {
        reorganized[detection.type] = [];
      }
      reorganized[detection.type].push(...lines);
    } else {
      // Low confidence - keep as unclassified
      unclassified[sectionName] = lines;
    }
  }
  
  // Try to merge unclassified sections into classified ones based on content
  for (const [sectionName, lines] of Object.entries(unclassified)) {
    if (!lines || lines.length === 0) continue;
    
    // Check if this section might belong to an existing classified section
    let bestFit = { type: sectionName, confidence: 0 };
    
    for (const classifiedType of Object.keys(reorganized)) {
      const detection = detectSectionType(sectionName, lines);
      if (detection.type === classifiedType && detection.confidence > bestFit.confidence) {
        bestFit = { type: classifiedType, confidence: detection.confidence };
      }
    }
    
    if (bestFit.confidence > 1.5) {
      reorganized[bestFit.type].push(...lines);
    } else {
      // Keep as separate section with original name
      reorganized[sectionName] = lines;
    }
  }
  
  return reorganized;
};

/**
 * Fallback section detection using content analysis when section names are unclear
 */
export const detectSectionsByContent = (sections: ResumeSectionToLines): ResumeSectionToLines => {
  const reorganized: ResumeSectionToLines = {};
  
  for (const [sectionName, lines] of Object.entries(sections)) {
    if (!lines || lines.length === 0) continue;
    
    const detection = detectSectionType(sectionName, lines);
    
    // If we have high confidence in a different type, reorganize
    if (detection.type !== 'unknown' && detection.confidence > 3) {
      if (!reorganized[detection.type]) {
        reorganized[detection.type] = [];
      }
      reorganized[detection.type].push(...lines);
    } else {
      // Keep original
      reorganized[sectionName] = lines;
    }
  }
  
  return reorganized;
};
