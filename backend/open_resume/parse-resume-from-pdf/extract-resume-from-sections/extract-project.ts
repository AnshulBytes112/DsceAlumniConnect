import type { ResumeProject } from "../../lib/redux/types";
import type {
  FeatureSet,
  Line,
  Lines,
  ResumeSectionToLines,
  Subsections,
} from "../types";
import { getSectionLinesByKeywordsEnhanced } from "./lib/enhanced-get-section-lines";
import {
  DATE_FEATURE_SETS,
  getHasText,
  isBold,
} from "./lib/common-features";
import { divideSectionIntoSubsections } from "./lib/subsections";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "./lib/bullet-points";

// ─── Constants ───────────────────────────────────────────────────────────────

// Matches • - * and en-dash – which some resumes use as bullet markers
const BULLET_START_RE = /^\s*[•\-\–\*\u2022\u25cf\u2013\u2014]/;

const DATE_RE =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\d{4})\b/i;

// Separator symbols some templates append to project names
const SEPARATOR_RE = /[§]/g;

// ─── Line-level helpers ───────────────────────────────────────────────────────

const getLineText = (line: Line): string =>
  line.map((item) => item.text).join(" ").trim();

const lineIsBold = (line: Line): boolean => line.some((item) => item.bold);

/** Matches bullet lines including en-dash (–) style bullets */
const lineIsBullet = (line: Line): boolean =>
  BULLET_START_RE.test(getLineText(line));

const lineHasDate = (line: Line): boolean =>
  DATE_RE.test(getLineText(line));

/** True if line contains a pipe | — used in "Project Name | Tech Stack" format */
const lineHasPipe = (line: Line): boolean =>
  getLineText(line).includes("|");

/** True if line contains § — used in "Project Name §" format */
const lineHasSection = (line: Line): boolean =>
  getLineText(line).includes("§");

/** Dominant font size of a line — most frequent size among all items */
const getDominantFontSize = (line: Line): number => {
  const freq: Record<number, number> = {};
  for (const item of line) {
    const sz = Math.round((item.height ?? 0) * 10) / 10;
    if (sz > 0) freq[sz] = (freq[sz] ?? 0) + 1;
  }
  const entries = Object.entries(freq);
  if (!entries.length) return 0;
  return Number(entries.sort((a, b) => b[1] - a[1])[0][0]);
};

/** Most common font size across all lines — represents body text */
const getBodyFontSize = (lines: Lines): number => {
  const freq: Record<number, number> = {};
  for (const line of lines) {
    const sz = getDominantFontSize(line);
    if (sz > 0) freq[sz] = (freq[sz] ?? 0) + 1;
  }
  const entries = Object.entries(freq);
  if (!entries.length) return 0;
  return Number(entries.sort((a, b) => b[1] - a[1])[0][0]);
};

// ─── Header detection strategies ─────────────────────────────────────────────

/**
 * Detects which header format is used in this projects section.
 *
 * We analyze the section lines to identify the format before splitting,
 * rather than assuming — this makes the splitter adapt to any resume.
 *
 * Formats handled:
 *
 *  A. PIPE format   — "Project Name | Tech Stack"  (Anshul's resume)
 *     Signal: bold line containing | that does NOT start with –
 *     Used by: modern resumes listing tech inline with project name
 *
 *  B. SECTION format — "Project Name §"            (Bharath's resume)
 *     Signal: line containing § symbol
 *     Used by: resumes with § as a visual separator
 *
 *  C. BOLD+SIZE format — project name is bold AND larger than body text
 *     Signal: bold line with font size > body size + 0.3px, short, non-bullet
 *     Used by: standard Word/LaTeX resumes
 *
 *  D. BOLD-ONLY format — project name is bold, same size as body
 *     Signal: bold line that is short and non-bullet and non-date
 *     Used by: resumes where bold is the only differentiator
 *
 *  E. FALLBACK — divideSectionIntoSubsections (blank-line based)
 *     Used by: plain-text resumes with no structural signals
 */
type HeaderFormat = "pipe" | "section" | "bold+size" | "bold" | "fallback";

const detectHeaderFormat = (lines: Lines): HeaderFormat => {
  const bodySize = getBodyFontSize(lines);

  const hasPipeHeaders = lines.some(
    (l) => !lineIsBullet(l) && lineHasPipe(l) && lineIsBold(l)
  );
  if (hasPipeHeaders) return "pipe";

  const hasSectionHeaders = lines.some((l) => lineHasSection(l));
  if (hasSectionHeaders) return "section";

  const hasBoldSizeHeaders = lines.some(
    (l) =>
      lineIsBold(l) &&
      !lineIsBullet(l) &&
      !lineHasDate(l) &&
      getDominantFontSize(l) > bodySize + 0.3
  );
  if (hasBoldSizeHeaders) return "bold+size";

  const hasBoldHeaders = lines.some(
    (l) => lineIsBold(l) && !lineIsBullet(l) && !lineHasDate(l)
  );
  if (hasBoldHeaders) return "bold";

  return "fallback";
};

// ─── Universal subsection splitter ───────────────────────────────────────────

const splitIntoSubsections = (lines: Lines): Subsections => {
  if (!lines.length) return [];

  const format = detectHeaderFormat(lines);

  if (format === "fallback") {
    return divideSectionIntoSubsections(lines);
  }

  const bodySize = getBodyFontSize(lines);

  /**
   * Returns true if this line is the start of a new project subsection.
   * Rules are specific to the detected format so we never misclassify
   * bullet points or date lines as headers.
   */
  const isProjectHeader = (line: Line): boolean => {
    // Bullet lines are never headers in any format
    if (lineIsBullet(line)) return false;

    switch (format) {
      case "pipe":
        // Header = bold + has pipe + does NOT start with – or bullet
        // "GitHub" single-word lines are NOT headers — absorbed into subsection
        return lineIsBold(line) && lineHasPipe(line);

      case "section":
        // Header = line contains § separator symbol
        return lineHasSection(line);

      case "bold+size":
        // Header = bold + larger than body text + short + not a date line
        return (
          lineIsBold(line) &&
          !lineHasDate(line) &&
          getDominantFontSize(line) > bodySize + 0.3
        );

      case "bold":
        // Header = bold + not a bullet + not a date
        return lineIsBold(line) && !lineHasDate(line);

      default:
        return false;
    }
  };

  const subsections: Subsections = [];
  let current: Lines = [];

  for (const line of lines) {
    // Skip empty lines or lines with only bullet markers
    const lineText = getLineText(line).trim();
    if (!lineText || 
        lineText.match(/^[-–•\*\u2022\u25cf\u2013\u2014]\s*$/) ||
        lineText.length <= 2) {
      continue;
    }
    
    if (isProjectHeader(line) && current.length > 0) {
      subsections.push(current);
      current = [];
    }
    current.push(line);
  }

  if (current.length > 0) subsections.push(current);

  return subsections;
};

// ─── Project name extraction helpers ─────────────────────────────────────────

/**
 * For pipe-format resumes, the project name is everything before the first |
 * e.g. "College Alumni Network Platform | Spring Boot, MongoDB, React" → "College Alumni Network Platform"
 */
const extractNameFromPipeLine = (line: Line): string => {
  const text = getLineText(line);
  const pipeIdx = text.indexOf("|");
  return pipeIdx !== -1 ? text.substring(0, pipeIdx).trim() : text.trim();
};

/**
 * For pipe-format resumes, the tech stack is everything after the first |
 * e.g. "College Alumni Network Platform | Spring Boot, MongoDB, React" → "Spring Boot, MongoDB, React"
 */
const extractTechFromPipeLine = (line: Line): string => {
  const text = getLineText(line);
  const pipeIdx = text.indexOf("|");
  return pipeIdx !== -1 ? text.substring(pipeIdx + 1).trim() : "";
};

/** Feature: boosts items on the first line of the subsection */
const isOnFirstLine =
  (subsectionLines: Lines) =>
  (item: Line[number]): boolean =>
    (subsectionLines[0] ?? []).some((fi) => fi.text === item.text);

// ─── Main extractor ───────────────────────────────────────────────────────────

export const extractProject = (sections: ResumeSectionToLines) => {
  const projects: ResumeProject[] = [];
  const projectsScores = [];

  const lines = getSectionLinesByKeywordsEnhanced(sections, ["project"], false);
  const format = detectHeaderFormat(lines);
  const subsections = splitIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    // ── Pipe format: extract name and tech directly from the header line ──
    if (format === "pipe" && subsectionLines.length > 0) {
      const headerLine = subsectionLines[0];
      const project = extractNameFromPipeLine(headerLine);

      // Date is on a separate line — find the first line that matches DATE_RE
      // (pipe-format resumes put date as a right-aligned item on the header line
      //  or on a dedicated line — check header line items first, then subsequent lines)
      const headerLineText = getLineText(headerLine);
      const dateMatch = headerLineText.match(
        /\b((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}|\d{4})\s*(–|-|to)\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}|present|\d{4})/i
      );
      // For this format dates are typically not on the project line itself —
      // find date in subsequent non-bullet lines
      let date = dateMatch ? dateMatch[0] : "";
      if (!date) {
        for (const line of subsectionLines.slice(1)) {
          const text = getLineText(line);
          if (!lineIsBullet(line) && DATE_RE.test(text)) {
            date = text;
            break;
          }
        }
      }

      // Bullet lines start from first line starting with – or •
      const descStartIdx = subsectionLines.findIndex((l) => lineIsBullet(l));
      const descriptionsLines =
        descStartIdx !== -1 ? subsectionLines.slice(descStartIdx) : [];
      const descriptions = getBulletPointsFromLines(descriptionsLines);

      projects.push({ project, date, descriptions });
      projectsScores.push({ projectScores: [], dateScores: [] });
      continue;
    }

    // ── All other formats: use feature scoring ──
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 1;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();

    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );

    const PROJECT_FEATURE_SET: FeatureSet[] = [
      [isOnFirstLine(subsectionLines), 3],
      [isBold, 2],
      [getHasText(date), -4],
    ];

    const [rawProject, projectScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      PROJECT_FEATURE_SET,
      false
    );

    const project = rawProject.replace(SEPARATOR_RE, "").trim();

    const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);

    projects.push({ project, date, descriptions });
    projectsScores.push({ projectScores, dateScores });
  }

  return { projects, projectsScores };
};