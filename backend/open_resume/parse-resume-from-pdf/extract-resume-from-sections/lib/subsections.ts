import { BULLET_POINTS } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";
import { isBold } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import type { Lines, Line, Subsections } from "lib/parse-resume-from-pdf/types";

/**
 * Divide lines into subsections based on difference in line gap or bold text.
 *
 * For profile section, we can directly pass all the text items to the feature
 * scoring systems. But for other sections, such as education and work experience,
 * we have to first divide the section into subsections since there can be multiple
 * schools or work experiences in the section. The feature scoring system then
 * process each subsection to retrieve each's resume attributes and append the results.
 */
export const divideSectionIntoSubsections = (lines: Lines): Subsections => {
  // 1. Preprocessing: Split lines that likely contain merged headers (Description + Title)
  // This is common when PDF extraction fails to catch an EOL and merges everything into one TextItem.
  const processedLines: Lines = [];

  // Regex to detect a project title pattern preceded by other text:
  // (something) (Title § Date/Year)
  const mergedHeaderRegex = /^(.*?)([\w\s\-\.\(\)]{3,50}§\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2}).*)$/i;

  for (const line of lines) {
    let currentSegment: Line = [];
    for (let i = 0; i < line.length; i++) {
      const item = line[i];
      const match = item.text.match(mergedHeaderRegex);

      if (match && match[1].trim() !== "" && match[2].trim() !== "") {
        // Log the split for debugging
        console.error(`[DEBUG subsections] Splitting merged item: "${match[1]}" | "${match[2]}"`);

        // Split this item into two separate segments
        if (currentSegment.length > 0) {
          currentSegment.push({ ...item, text: match[1] });
          processedLines.push(currentSegment);
        } else {
          processedLines.push([{ ...item, text: match[1] }]);
        }
        currentSegment = [{ ...item, text: match[2] }];
      } else if (i > 0 && (item.text.includes("§") || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2})/i.test(item.text.trim()))) {
        if (currentSegment.length > 0) processedLines.push(currentSegment);
        currentSegment = [item];
      } else {
        currentSegment.push(item);
      }
    }
    if (currentSegment.length > 0) processedLines.push(currentSegment);
  }

  // The main heuristic to determine a subsection is to check if its vertical line gap
  // is larger than the typical line gap * 1.4
  const isLineNewSubsectionByLineGap =
    createIsLineNewSubsectionByLineGap(processedLines);

  let subsections = createSubsections(processedLines, isLineNewSubsectionByLineGap);

  // Fallback 1: use bold headings
  if (subsections.length === 1) {
    const isLineNewSubsectionByBold = (line: Line, prevLine: Line) => {
      if (
        !isBold(prevLine[0]) &&
        isBold(line[0]) &&
        !BULLET_POINTS.includes(line[0].text)
      ) {
        return true;
      }
      return false;
    };
    subsections = createSubsections(processedLines, isLineNewSubsectionByBold);
  }

  // Fallback 2: split on lines that look like date headers or project titles (especially with "§")
  if (subsections.length === 1) {
    const yearRegex = /(19|20)\d{2}/;
    const presentRegex = /present|current|ongoing/i;

    const lineHasDateClue = (line: Line) => {
      const text = line.map((i) => i.text).join(" ");
      return text.includes("§") || yearRegex.test(text) || presentRegex.test(text);
    };

    const isLineNewSubsectionByDate = (line: Line, prevLine: Line) => {
      const text = line.map((i) => i.text).join(" ");
      // Direct hit on "§" separator
      if (text.includes("§")) return true;
      return lineHasDateClue(line) && !lineHasDateClue(prevLine);
    };

    const dateBasedSubsections = createSubsections(processedLines, isLineNewSubsectionByDate);
    if (dateBasedSubsections.length > 1) {
      subsections = dateBasedSubsections;
    }
  }

  // Fallback 3: Pattern-based splitting (Short lines followed by bullets)
  if (subsections.length === 1) {
    const isLineNewSubsectionByPattern = (line: Line, prevLine: Line, nextLine?: Line) => {
      const text = line.map((i) => i.text).join(" ").trim();
      const prevText = prevLine.map((i) => i.text).join(" ").trim();
      const isBullet = (t: string) => BULLET_POINTS.some(bp => t.startsWith(bp));

      if (!isBullet(text) && nextLine) {
        const nextText = nextLine.map((i) => i.text).join(" ").trim();
        if (isBullet(nextText) && text.length < 80 && prevText.length > 0) {
          return true;
        }
      }
      return false;
    };

    const createSubsectionsWithNext = (lines: Lines) => {
      const results: Subsections = [];
      let sub: Lines = [];
      for (let i = 0; i < lines.length; i++) {
        if (i > 0 && isLineNewSubsectionByPattern(lines[i], lines[i - 1], lines[i + 1])) {
          results.push(sub);
          sub = [];
        }
        sub.push(lines[i]);
      }
      if (sub.length > 0) results.push(sub);
      return results;
    };

    const patternBasedSubsections = createSubsectionsWithNext(processedLines);
    if (patternBasedSubsections.length > 1) {
      subsections = patternBasedSubsections;
    }
  }

  return subsections;
};

type IsLineNewSubsection = (line: Line, prevLine: Line) => boolean;

const createIsLineNewSubsectionByLineGap = (
  lines: Lines
): IsLineNewSubsection => {
  // Extract the common typical line gap
  const lineGapToCount: { [lineGap: number]: number } = {};
  const linesY = lines.map((line) => line[0].y);
  let lineGapWithMostCount: number = 0;
  let maxCount = 0;
  for (let i = 1; i < linesY.length; i++) {
    const lineGap = Math.round(linesY[i - 1] - linesY[i]);
    if (!lineGapToCount[lineGap]) lineGapToCount[lineGap] = 0;
    lineGapToCount[lineGap] += 1;
    if (lineGapToCount[lineGap] > maxCount) {
      lineGapWithMostCount = lineGap;
      maxCount = lineGapToCount[lineGap];
    }
  }
  // Use common line gap to set a sub section threshold
  const subsectionLineGapThreshold = lineGapWithMostCount * 1.4;

  const isLineNewSubsection = (line: Line, prevLine: Line) => {
    return Math.round(prevLine[0].y - line[0].y) > subsectionLineGapThreshold;
  };

  return isLineNewSubsection;
};

const createSubsections = (
  lines: Lines,
  isLineNewSubsection: IsLineNewSubsection
): Subsections => {
  const subsections: Subsections = [];
  let subsection: Lines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      subsection.push(line);
      continue;
    }
    if (isLineNewSubsection(line, lines[i - 1])) {
      subsections.push(subsection);
      subsection = [];
    }
    subsection.push(line);
  }
  if (subsection.length > 0) {
    subsections.push(subsection);
  }
  return subsections;
};
