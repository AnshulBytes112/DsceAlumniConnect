import type { ResumeWorkExperience } from "../../lib/redux/types";
import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "../types";
import { getSectionLinesByKeywordsEnhanced } from "./lib/enhanced-get-section-lines";
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

// Tech/keyword patterns that indicate description lines
const TECH_KEYWORDS = [
  'Terraform', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Docker', 'Git',
  'Python', 'Java', 'Go', 'Golang', 'JavaScript', 'TypeScript',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Kafka', 'API', 'REST',
  'CI/CD', 'DevOps', 'Backend', 'Frontend', 'Microservices', 'Cloud'
];

const isDescriptionLine = (item: TextItem): boolean => {
  const text = item.text;
  // Check for tech keywords
  const hasTechKeywords = TECH_KEYWORDS.some(kw => text.includes(kw));
  // Check for dashes with dates or descriptions
  const hasDashDate = /\d{4}\s*[-–]\s*\d{4}/.test(text) || /[-–]\s*(Present|Current)/.test(text);
  // Check for bullet points
  const hasBullet = /^[–\-•\*]\s/.test(text);
  // Check for common action verbs that start descriptions
  const hasActionVerb = /^(Built|Developed|Designed|Implemented|Created|Architected|Led|Integrated|Managed|Deployed|Setup|Migrated)/.test(text);
  
  return hasTechKeywords || hasDashDate || hasBullet || hasActionVerb;
};

const isLikelyCompanyName = (item: TextItem): boolean => {
  const text = item.text.trim();
  // Skip if too long (likely not a company name)
  if (text.length > 60) return false;
  // Skip if contains tech keywords
  if (isDescriptionLine(item)) return false;
  // Skip if it's just a date
  if (/^\d{4}\s*[-–]\s*/.test(text)) return false;
  // Skip if it starts with dash or bullet
  if (/^[–\-•\*]\s/.test(text)) return false;
  // Good signs: short, contains letters, not too many numbers
  return true;
};

// Job title detection with improved filtering
const JOB_TITLE_FEATURE_SET: FeatureSet[] = [
  [hasJobTitle, 4],
  [isBold, 2],
  [hasNumber, -1],
  [hasMoreThan5Words, -2],
  // Penalize lines that look like descriptions
  [(item: TextItem) => isDescriptionLine(item), -5],
  // Reward shorter lines
  [(item: TextItem) => item.text.split(/\s/).length <= 4, 2],
];

// Company name detection with improved filtering
const getCompanyFeatureSet = (date: string, jobTitle: string): FeatureSet[] => [
  [isBold, 2],
  // Penalize if contains date info
  [getHasText(date), -4],
  // Penalize if contains job title info
  [getHasText(jobTitle), -4],
  // NEW: Penalize description-like lines
  [(item: TextItem) => isDescriptionLine(item), -10],
  // NEW: Reward likely company names
  [(item: TextItem) => isLikelyCompanyName(item), 3],
  // Penalize long lines
  [(item: TextItem) => item.text.length > 50, -3],
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
  const lines = getSectionLinesByKeywordsEnhanced(
    sections,
    WORK_EXPERIENCE_KEYWORDS_LOWERCASE,
    false
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
    const COMPANY_FEATURE_SET = getCompanyFeatureSet(date, jobTitle);
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
