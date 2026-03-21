import type { ResumeSectionToLines, Lines, TextItem } from "../../types";

/**
 * Debug utility for the resume parser
 * Provides detailed logging and analysis of parsing decisions
 */

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'verbose' | 'normal' | 'minimal';
  logToConsole: boolean;
  logToFile?: string;
}

export interface ParsingDecision {
  step: string;
  input: any;
  output: any;
  confidence?: number;
  reason?: string;
}

export interface DebugReport {
  timestamp: string;
  sections: string[];
  decisions: ParsingDecision[];
  detectedFormats: Record<string, string>;
  errors: string[];
  warnings: string[];
  performance: {
    totalTime: number;
    sectionTimes: Record<string, number>;
  };
}

let debugConfig: DebugConfig = {
  enabled: false,
  logLevel: 'normal',
  logToConsole: true
};

const decisions: ParsingDecision[] = [];
const startTimes: Record<string, number> = {};

/**
 * Configure debug settings
 */
export const configureDebug = (config: Partial<DebugConfig>): void => {
  debugConfig = { ...debugConfig, ...config };
};

/**
 * Log a parsing decision for debugging
 */
export const logDecision = (step: string, input: any, output: any, confidence?: number, reason?: string): void => {
  if (!debugConfig.enabled) return;
  
  const decision: ParsingDecision = {
    step,
    input,
    output,
    confidence,
    reason
  };
  
  decisions.push(decision);
  
  if (debugConfig.logToConsole) {
    const message = `[${step}] ${reason || ''} ${confidence ? `(confidence: ${confidence.toFixed(2)})` : ''}`;
    
    switch (debugConfig.logLevel) {
      case 'verbose':
        console.log(message, { input, output });
        break;
      case 'normal':
        console.log(message);
        break;
      case 'minimal':
        if (confidence !== undefined && confidence < 2) {
          console.log(`Low confidence: ${message}`);
        }
        break;
    }
  }
};

/**
 * Start timing a section extraction
 */
export const startSectionTimer = (sectionName: string): void => {
  if (!debugConfig.enabled) return;
  startTimes[sectionName] = performance.now();
};

/**
 * End timing a section extraction
 */
export const endSectionTimer = (sectionName: string): number => {
  if (!debugConfig.enabled || !startTimes[sectionName]) return 0;
  
  const duration = performance.now() - startTimes[sectionName];
  delete startTimes[sectionName];
  
  logDecision('timing', { section: sectionName }, { duration: `${duration.toFixed(2)}ms` });
  
  return duration;
};

/**
 * Analyze section content for debugging
 */
export const analyzeSectionContent = (sectionName: string, lines: Lines): Record<string, any> => {
  const analysis = {
    totalLines: lines.length,
    totalTextItems: lines.flat().length,
    averageItemsPerLine: lines.length > 0 ? lines.flat().length / lines.length : 0,
    hasBoldText: lines.some((line: TextItem[]) => line.some((item: TextItem) => item.bold)),
    fontSizes: new Set(lines.flat().map((item: TextItem) => Math.round(item.height * 10) / 10)),
    sampleText: lines.slice(0, 2).flat().map(item => item.text).join(' ').substring(0, 100)
  };
  
  logDecision('content-analysis', { section: sectionName }, analysis);
  
  return analysis;
};

/**
 * Log section detection results
 */
export const logSectionDetection = (
  sectionName: string, 
  detectedType: string, 
  confidence: number, 
  allScores: Record<string, number>
): void => {
  if (!debugConfig.enabled) return;
  
  logDecision(
    'section-detection',
    { sectionName },
    { detectedType, confidence },
    confidence,
    `All scores: ${JSON.stringify(allScores)}`
  );
};

/**
 * Generate a comprehensive debug report
 */
export const generateDebugReport = (): DebugReport => {
  const now = new Date();
  
  return {
    timestamp: now.toISOString(),
    sections: [],
    decisions: [...decisions],
    detectedFormats: {},
    errors: [],
    warnings: [],
    performance: {
      totalTime: 0,
      sectionTimes: {}
    }
  };
};

/**
 * Clear debug history
 */
export const clearDebugHistory = (): void => {
  decisions.length = 0;
  Object.keys(startTimes).forEach(key => delete startTimes[key]);
};

/**
 * Debug wrapper for section extraction
 */
export const debugSectionExtraction = <T>(
  sectionName: string,
  lines: Lines,
  extractor: (lines: Lines) => T
): T => {
  if (!debugConfig.enabled) {
    return extractor(lines);
  }
  
  startSectionTimer(sectionName);
  
  // Analyze content
  analyzeSectionContent(sectionName, lines);
  
  try {
    const result = extractor(lines);
    
    endSectionTimer(sectionName);
    
    logDecision(
      'extraction-complete',
      { section: sectionName, lines: lines.length },
      { success: true, hasResult: result !== null }
    );
    
    return result;
  } catch (error) {
    endSectionTimer(sectionName);
    
    logDecision(
      'extraction-failed',
      { section: sectionName },
      { error: error instanceof Error ? error.message : 'Unknown error' },
      undefined,
      'Extraction failed with error'
    );
    
    throw error;
  }
};

/**
 * Pretty print debug report
 */
export const printDebugReport = (report: DebugReport): void => {
  console.log('\n=== RESUME PARSER DEBUG REPORT ===');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Total Decisions: ${report.decisions.length}`);
  
  // Group decisions by step
  const groupedDecisions = report.decisions.reduce((acc, decision) => {
    if (!acc[decision.step]) {
      acc[decision.step] = [];
    }
    acc[decision.step].push(decision);
    return acc;
  }, {} as Record<string, ParsingDecision[]>);
  
  console.log('\n--- Decision Summary ---');
  Object.entries(groupedDecisions).forEach(([step, decisions]) => {
    console.log(`${step}: ${decisions.length} decisions`);
    
    decisions.forEach(d => {
      if (d.confidence !== undefined && d.confidence < 2) {
        console.log(`  ⚠️ Low confidence (${d.confidence.toFixed(2)}): ${d.reason || ''}`);
      }
    });
  });
  
  console.log('\n=== END DEBUG REPORT ===\n');
};

// Enable debug mode by default in development
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  configureDebug({ enabled: true, logLevel: 'normal' });
}
