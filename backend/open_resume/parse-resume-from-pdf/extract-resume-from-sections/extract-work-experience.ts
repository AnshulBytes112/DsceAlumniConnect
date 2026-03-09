import type { ResumeWorkExperience } from "../../lib/redux/types";
import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "../types";
import { getSectionLinesByKeywords } from "./lib/get-section-lines";
import {
  DATE_FEATURE_SETS,
  hasNumber,
  getHasText,
  isBold,
} from "./lib/common-features";
import { divideSectionIntoSubsections } from "./lib/subsections";
import { getTextWithHighestFeatureScore } from "./lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "./lib/bullet-points";

// prettier-ignore
const WORK_EXPERIENCE_KEYWORDS_LOWERCASE = [
  'work',
  'experience',
  'employment',
  'history',
  'job',
  // Additional common headings
  'professional',
  'career',
  'internship',
  'internships',
];

// Keywords that typically indicate we've reached a different section like
// Achievements, Awards, Certifications, etc. We should not treat lines after
// these as part of a work-experience description block.
const NON_WORK_SECTION_KEYWORDS = [
  'achievement',
  'achievements',
  'award',
  'awards',
  'honor',
  'honors',
  'certification',
  'certifications',
  'accomplishment',
  'accomplishments',
  'extra-curricular',
  'extracurricular',
];
// prettier-ignore
const JOB_TITLES = ['Accountant', 'Administrator', 'Advisor', 'Agent', 'Analyst', 'Apprentice', 'Architect', 'Assistant', 'Associate', 'Auditor', 'Bartender', 'Biologist', 'Bookkeeper', 'Buyer', 'Carpenter', 'Cashier', 'CEO', 'Clerk', 'Co-op', 'Co-Founder', 'Consultant', 'Coordinator', 'CTO', 'Developer', 'Designer', 'Director', 'Driver', 'Editor', 'Electrician', 'Engineer', 'Extern', 'Founder', 'Freelancer', 'Head', 'Intern', 'Janitor', 'Journalist', 'Laborer', 'Lawyer', 'Lead', 'Manager', 'Mechanic', 'Member', 'Nurse', 'Officer', 'Operator', 'Operation', 'Photographer', 'President', 'Producer', 'Recruiter', 'Representative', 'Researcher', 'Sales', 'Server', 'Scientist', 'Specialist', 'Supervisor', 'Teacher', 'Technician', 'Trader', 'Trainee', 'Treasurer', 'Tutor', 'Vice', 'VP', 'Volunteer', 'Webmaster', 'Worker'];

const hasJobTitle = (item: TextItem) =>
  JOB_TITLES.some((jobTitle) =>
    item.text.split(/\s/).some((word) => word === jobTitle)
  );
const hasMoreThan5Words = (item: TextItem) => item.text.split(/\s/).length > 5;

// Job title detection:
// - Strongly reward known job-title words
// - Slightly penalize very long lines (likely descriptions)
// - Only lightly penalize numbers, since many resumes put dates on the same line
// - Reward bold text, as titles are often bolded
const JOB_TITLE_FEATURE_SET: FeatureSet[] = [
  [hasJobTitle, 4],
  [isBold, 2],
  [hasNumber, -1],
  [hasMoreThan5Words, -2],
];

// Helper to parse common date-range formats like:
// "Jan 2020 - Present", "January 2019 – Jun 2021", "2018 - 2020"
const MONTH_MAP: { [key: string]: string } = {
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

type ParsedDateRange = {
  month?: string;
  year?: string;
  endMonth?: string;
  endYear?: string;
  currentlyWorking?: boolean;
};

const normalizeMonth = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const key = raw.toLowerCase();
  return MONTH_MAP[key] ?? undefined;
};

const parseDateRange = (date: string): ParsedDateRange => {
  if (!date) return {};

  const normalized = date.replace(/–|—|to/gi, '-');
  const parts = normalized.split('-').map((p) => p.trim()).filter(Boolean);

  const result: ParsedDateRange = {};

  const presentRegex = /present|current|ongoing/i;
  if (parts.length >= 2 && presentRegex.test(parts[1])) {
    result.currentlyWorking = true;
  }

  const startPart = parts[0] ?? '';
  const endPart = parts.length >= 2 ? parts[1] : '';

  // e.g. "Jan 2020" or "January 2020"
  const monthYearRegex = /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i;
  // e.g. "02/2020" or "2-2020"
  const numericMonthYearRegex = /(\d{1,2})[\/\-](\d{4})/;
  const yearOnlyRegex = /(19|20)\d{2}/;

  const startMy = startPart.match(monthYearRegex);
  if (startMy) {
    result.month = normalizeMonth(startMy[1]);
    result.year = startMy[2];
  } else {
    const startNm = startPart.match(numericMonthYearRegex);
    if (startNm) {
      // Convert "2" or "02" to a pseudo-abbreviation like "Feb" where possible
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
      result.endMonth = normalizeMonth(endMy[1]);
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

export const extractWorkExperience = (sections: ResumeSectionToLines) => {
  const workExperiences: ResumeWorkExperience[] = [];
  const workExperiencesScores = [];
  const lines = getSectionLinesByKeywords(
    sections,
    WORK_EXPERIENCE_KEYWORDS_LOWERCASE
  );
  const subsections = divideSectionIntoSubsections(lines);

  for (let subsectionLines of subsections) {
    // If this subsection contains a heading for a non-work section
    // like "Achievements", cut everything from that heading onwards.
    // If the heading is the very first line, skip this subsection entirely.
    const nonWorkIdx = subsectionLines.findIndex((line) => {
      const text = line.map((i) => i.text).join(" ").toLowerCase();
      return NON_WORK_SECTION_KEYWORDS.some((kw) => text.includes(kw));
    });

    if (nonWorkIdx === 0) {
      // This subsection is actually a non-work section; skip it.
      continue;
    } else if (nonWorkIdx > 0) {
      subsectionLines = subsectionLines.slice(0, nonWorkIdx);
    }

    if (subsectionLines.length === 0) {
      continue;
    }
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 2;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const [jobTitle, jobTitleScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      JOB_TITLE_FEATURE_SET
    );
    const COMPANY_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
      [getHasText(jobTitle), -4],
    ];
    const [company, companyScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      COMPANY_FEATURE_SET,
      false
    );

    const subsectionDescriptionsLines =
      subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(subsectionDescriptionsLines);

    const parsedRange = parseDateRange(date);

    workExperiences.push({
      company,
      jobTitle,
      date,
      descriptions,
      month: parsedRange.month,
      year: parsedRange.year,
      endMonth: parsedRange.endMonth,
      endYear: parsedRange.endYear,
      currentlyWorking: parsedRange.currentlyWorking,
    });
    workExperiencesScores.push({
      companyScores,
      jobTitleScores,
      dateScores,
    });
  }
  return { workExperiences, workExperiencesScores };
};
