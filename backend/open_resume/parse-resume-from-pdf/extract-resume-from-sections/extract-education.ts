import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import type { ResumeEducation } from "lib/redux/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { divideSectionIntoSubsections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsections";
import {
  DATE_FEATURE_SETS,
  hasComma,
  hasLetter,
  hasNumber,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

/**
 *              Unique Attribute
 * School       Has school
 * Degree       Has degree
 * GPA          Has number
 */

// prettier-ignore
const SCHOOLS = ['College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet']
const hasSchool = (item: TextItem) =>
  SCHOOLS.some((school) => item.text.includes(school));
// prettier-ignore
const DEGREES = ["Associate", "Bachelor", "Master", "PhD", "Ph."];
const hasDegree = (item: TextItem) =>
  DEGREES.some((degree) => item.text.includes(degree)) ||
  /[ABM][A-Z\.]/.test(item.text); // Match AA, B.S., MBA, etc.
const matchGPA = (item: TextItem) => item.text.match(/[0-4]\.\d{1,2}/);
const matchGrade = (item: TextItem) => {
  const grade = parseFloat(item.text);
  if (Number.isFinite(grade) && grade <= 110) {
    return [String(grade)] as RegExpMatchArray;
  }
  return null;
};

const SCHOOL_FEATURE_SETS: FeatureSet[] = [
  [hasSchool, 4],
  [hasDegree, -4],
  [hasNumber, -4],
];

const DEGREE_FEATURE_SETS: FeatureSet[] = [
  [hasDegree, 4],
  [hasSchool, -4],
  [hasNumber, -3],
];

const GPA_FEATURE_SETS: FeatureSet[] = [
  [matchGPA, 4, true],
  [matchGrade, 3, true],
  [hasComma, -3],
  [hasLetter, -4],
];

// Reuse the same date-range parsing logic concept as work experience,
// but keep it local here to avoid cross-file imports.
const EDU_MONTH_MAP: { [key: string]: string } = {
  january: 'Jan',
  february: 'Feb',
  march: 'Mar',
  april: 'Apr',
  may: 'May',
  june: 'Jun',
  july: 'Jul',
  august: 'Aug',
  september: 'Sep',
  october: 'Oct',
  november: 'Nov',
  december: 'Dec',
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dec: 'Dec',
};

type EduParsedDateRange = {
  month?: string;
  year?: string;
  endMonth?: string;
  endYear?: string;
  currentlyPursuing?: boolean;
};

const normalizeEduMonth = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const key = raw.toLowerCase();
  return EDU_MONTH_MAP[key] ?? undefined;
};

const parseEduDateRange = (date: string): EduParsedDateRange => {
  if (!date) return {};

  const normalized = date.replace(/–|—|to/gi, '-');
  const parts = normalized.split('-').map((p) => p.trim()).filter(Boolean);

  const result: EduParsedDateRange = {};

  const presentRegex = /present|current|ongoing|pursuing|studying/i;
  if (parts.length >= 2 && presentRegex.test(parts[1])) {
    result.currentlyPursuing = true;
  }

  const startPart = parts[0] ?? '';
  const endPart = parts.length >= 2 ? parts[1] : '';

  const monthYearRegex = /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i;
  const numericMonthYearRegex = /(\d{1,2})[\/\-](\d{4})/;
  const yearOnlyRegex = /(19|20)\d{2}/;

  const startMy = startPart.match(monthYearRegex);
  if (startMy) {
    result.month = normalizeEduMonth(startMy[1]);
    result.year = startMy[2];
  } else {
    const startNm = startPart.match(numericMonthYearRegex);
    if (startNm) {
      const monthNum = parseInt(startNm[1], 10);
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      if (monthNum >= 1 && monthNum <= 12) {
        result.month = monthNames[monthNum - 1];
      }
      result.year = startNm[2];
    } else {
      const startYear = startPart.match(yearOnlyRegex);
      if (startYear) {
        result.year = startYear[0];
      }
    }
  }

  if (endPart && !presentRegex.test(endPart)) {
    const endMy = endPart.match(monthYearRegex);
    if (endMy) {
      result.endMonth = normalizeEduMonth(endMy[1]);
      result.endYear = endMy[2];
    } else {
      const endNm = endPart.match(numericMonthYearRegex);
      if (endNm) {
        const monthNum = parseInt(endNm[1], 10);
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];
        if (monthNum >= 1 && monthNum <= 12) {
          result.endMonth = monthNames[monthNum - 1];
        }
        result.endYear = endNm[2];
      } else {
        const endYear = endPart.match(yearOnlyRegex);
        if (endYear) {
          result.endYear = endYear[0];
        }
      }
    }
  }

  return result;
};

export const extractEducation = (sections: ResumeSectionToLines) => {
  const educations: ResumeEducation[] = [];
  const educationsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["education"]);
  const subsections = divideSectionIntoSubsections(lines);
  for (const subsectionLines of subsections) {
    const textItems = subsectionLines.flat();
    const [school, schoolScores] = getTextWithHighestFeatureScore(
      textItems,
      SCHOOL_FEATURE_SETS
    );
    const [degree, degreeScores] = getTextWithHighestFeatureScore(
      textItems,
      DEGREE_FEATURE_SETS
    );
    const [gpa, gpaScores] = getTextWithHighestFeatureScore(
      textItems,
      GPA_FEATURE_SETS
    );
    const [date, dateScores] = getTextWithHighestFeatureScore(
      textItems,
      DATE_FEATURE_SETS
    );

    let descriptions: string[] = [];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines);
    if (descriptionsLineIdx !== undefined) {
      const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
      descriptions = getBulletPointsFromLines(descriptionsLines);
    }

    const parsedRange = parseEduDateRange(date);

    educations.push({
      school,
      degree,
      gpa,
      date,
      descriptions,
      month: parsedRange.month,
      year: parsedRange.year,
      endMonth: parsedRange.endMonth,
      endYear: parsedRange.endYear,
      currentlyPursuing: parsedRange.currentlyPursuing,
    });
    educationsScores.push({
      schoolScores,
      degreeScores,
      gpaScores,
      dateScores,
    });
  }

  if (educations.length !== 0) {
    const coursesLines = getSectionLinesByKeywords(sections, ["course"]);
    if (coursesLines.length !== 0) {
      educations[0].descriptions.push(
        "Courses: " +
        coursesLines
          .flat()
          .map((item) => item.text)
          .join(" ")
      );
    }
  }

  return {
    educations,
    educationsScores,
  };
};
