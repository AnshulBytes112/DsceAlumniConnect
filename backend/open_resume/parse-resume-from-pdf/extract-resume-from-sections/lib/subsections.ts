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
  // The main heuristic to determine a subsection is to check if its vertical line gap
  // is larger than the typical line gap * 1.4
  const isLineNewSubsectionByLineGap =
    createIsLineNewSubsectionByLineGap(lines);

  let subsections = createSubsections(lines, isLineNewSubsectionByLineGap);

  // Fallback heuristic if the main heuristic doesn't apply: use bold headings
  if (subsections.length === 1) {
    const isLineNewSubsectionByBold = (line: Line, prevLine: Line) => {
      if (
        !isBold(prevLine[0]) &&
        isBold(line[0]) &&
        // Ignore bullet points that sometimes are marked as bolded
        !BULLET_POINTS.includes(line[0].text)
      ) {
        return true;
      }
      return false;
    };

    subsections = createSubsections(lines, isLineNewSubsectionByBold);
  }

  // Second fallback: split on lines that look like date headers (e.g. "Jan 2020 - Present")
  // This helps when multiple experiences are stacked with similar line gaps and no bold titles.
  if (subsections.length === 1) {
    const yearRegex = /(19|20)\d{2}/;
    const presentRegex = /present|current|ongoing/i;

    const lineHasDateClue = (line: Line) => {
      const text = line.map((i) => i.text).join(" ");
      return yearRegex.test(text) || presentRegex.test(text);
    };

    const isLineNewSubsectionByDate = (line: Line, prevLine: Line) => {
      // Treat a line that contains a year/present marker as a new subsection
      // when the previous line did not contain such a marker.
      return lineHasDateClue(line) && !lineHasDateClue(prevLine);
    };

    const dateBasedSubsections = createSubsections(lines, isLineNewSubsectionByDate);
    if (dateBasedSubsections.length > 1) {
      subsections = dateBasedSubsections;
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
