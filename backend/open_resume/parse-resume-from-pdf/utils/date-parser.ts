export const MONTH_MAP: Readonly<{ [key: string]: string }> = Object.freeze({
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
  january_short: 'Jan',
  february_short: 'Feb',
  march_short: 'Mar',
  april_short: 'Apr',
  may_short: 'May',
  june_short: 'Jun',
  july_short: 'Jul',
  august_short: 'Aug',
  september_short: 'Sep',
  october_short: 'Oct',
  november_short: 'Nov',
  december_short: 'Dec',
});

export type ParsedDateRange = {
  month?: string;
  year?: string;
  endMonth?: string;
  endYear?: string;
  currentlyWorking?: boolean;
  startDate?: Date;
  endDate?: Date;
};

const MONTH_NAMES_FULL = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_NAMES_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

const MONTH_REGEX = new RegExp(
  `^(${MONTH_NAMES_FULL.join('|')}|${MONTH_NAMES_SHORT.join('|')})$`,
  'i'
);

const MONTH_YEAR_REGEX = new RegExp(
  `(?:(${MONTH_NAMES_FULL.join('|')}|${MONTH_NAMES_SHORT.join('|')})\\s+)?(\\d{4})`,
  'i'
);

const NUMERIC_MONTH_YEAR_REGEX = /(\d{1,2})[\/\-](\d{4})/;
const YEAR_ONLY_REGEX = /(19|20)\d{2}/;
const PRESENT_REGEX = /present|current|ongoing|pursuing|studying|now/i;

const normalizeMonth = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim();
  return MONTH_MAP[key] ?? undefined;
};

const parseMonthYear = (input: string): { month?: string; year?: string } => {
  const result: { month?: string; year?: string } = {};

  const monthYearMatch = input.match(MONTH_YEAR_REGEX);
  if (monthYearMatch) {
    result.month = normalizeMonth(monthYearMatch[1]);
    result.year = monthYearMatch[2];
    return result;
  }

  const numericMatch = input.match(NUMERIC_MONTH_YEAR_REGEX);
  if (numericMatch) {
    const monthNum = parseInt(numericMatch[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      result.month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthNum - 1];
    }
    result.year = numericMatch[2];
    return result;
  }

  const yearMatch = input.match(YEAR_ONLY_REGEX);
  if (yearMatch) {
    result.year = yearMatch[0];
  }

  return result;
};

const createDate = (month: string | undefined, year: string | undefined): Date | undefined => {
  if (!year) return undefined;
  const m = month ? MONTH_NAMES_FULL.findIndex(mn => 
    mn.toLowerCase() === month.toLowerCase() || 
    MONTH_MAP[month.toLowerCase()]?.toLowerCase() === mn.toLowerCase()
  ) + 1 : 1;
  return new Date(parseInt(year), m - 1, 1);
};

export const parseDateRange = (date: string): ParsedDateRange => {
  if (!date || typeof date !== 'string') {
    return {};
  }

  const normalized = date.replace(/–|—/gi, '-').replace(/\s+to\s+/gi, '-').trim();
  const parts = normalized.split('-').map(p => p.trim()).filter(Boolean);

  const result: ParsedDateRange = {};

  if (parts.length >= 2) {
    if (PRESENT_REGEX.test(parts[1])) {
      result.currentlyWorking = true;
    }
  }

  const startPart = parts[0] ?? '';
  const endPart = parts.length >= 2 ? parts[1] : '';

  const startParsed = parseMonthYear(startPart);
  result.month = startParsed.month;
  result.year = startParsed.year;

  if (endPart && !PRESENT_REGEX.test(endPart)) {
    const endParsed = parseMonthYear(endPart);
    result.endMonth = endParsed.month;
    result.endYear = endParsed.year;
  }

  result.startDate = createDate(result.month, result.year);
  result.endDate = createDate(result.endMonth, result.endYear);

  return result;
};

export const formatDateRange = (parsed: ParsedDateRange): string => {
  const parts: string[] = [];
  
  if (parsed.month && parsed.year) {
    parts.push(`${parsed.month} ${parsed.year}`);
  } else if (parsed.year) {
    parts.push(parsed.year);
  }
  
  if (parsed.currentlyWorking) {
    parts.push('Present');
  } else if (parsed.endMonth && parsed.endYear) {
    parts.push(`${parsed.endMonth} ${parsed.endYear}`);
  } else if (parsed.endYear) {
    parts.push(parsed.endYear);
  }
  
  return parts.length >= 2 ? parts.join(' - ') : parts[0] ?? '';
};

export const hasDateRange = (text: string): boolean => {
  if (!text) return false;
  const normalized = text.replace(/–|—/gi, '-');
  const dashCount = (normalized.match(/-+/g) || []).length;
  return dashCount >= 1;
};

export const extractDateRangesFromText = (text: string): string[] => {
  const dateRangePattern = new RegExp(
    `(${MONTH_NAMES_FULL.join('|')}|${MONTH_NAMES_SHORT.join('|')})?\\s*\\d{4}\\s*[-–—to]+\\s*` +
    `(${MONTH_NAMES_FULL.join('|')}|${MONTH_NAMES_SHORT.join('|')})?\\s*(\\d{4}|present|current|ongoing)?`,
    'gi'
  );
  
  const matches = text.match(dateRangePattern);
  return matches ? matches.map(m => m.trim()) : [];
};

export const parseSingleDate = (input: string): ParsedDateRange => {
  if (!input || typeof input !== 'string') {
    return {};
  }

  const normalized = input.trim();
  const isPresent = PRESENT_REGEX.test(normalized);
  
  const parsed = parseMonthYear(normalized);
  
  return {
    month: parsed.month,
    year: parsed.year,
    currentlyWorking: isPresent,
    startDate: createDate(parsed.month, parsed.year),
  };
};
