import type { Prisma, Salary } from "@prisma/client";

export const SALARY_LEVELS = ["L3", "L4", "L5"] as const;

export type SalaryLevel = (typeof SALARY_LEVELS)[number];

export type SalaryFilters = {
  company?: string;
  role?: string;
  level?: string;
  location?: string;
};

export type SortDirection = "asc" | "desc";

export type SalaryInput = {
  company: string;
  role: string;
  level: SalaryLevel;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  confidence_score: number;
};

const REQUIRED_TEXT_FIELDS = ["company", "role", "level", "location"] as const;
const REQUIRED_NUMBER_FIELDS = ["experience_years", "base_salary"] as const;
const OPTIONAL_NUMBER_FIELDS = ["bonus", "stock", "confidence_score"] as const;
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export function normalizeCompany(company: unknown) {
  if (typeof company !== "string") {
    return "";
  }

  return company.trim().toLowerCase();
}

export function displayCompany(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function standardizeLevel(level: unknown) {
  if (typeof level !== "string") {
    return "";
  }

  return level.trim().toUpperCase();
}

export function parseSalaryPayload(payload: unknown):
  | { ok: true; data: SalaryInput }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const body = payload as Record<string, unknown>;
  const levelInput = body.level ?? body.level_standardized;
  const confidenceInput = body.confidence_score ?? body.confidence;

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (field === "level") {
      continue;
    }

    if (typeof body[field] !== "string" || body[field].trim().length === 0) {
      return { ok: false, error: `${field} is required.` };
    }
  }

  const normalizedCompany = normalizeCompany(body.company);
  if (!normalizedCompany) {
    return { ok: false, error: "company is required." };
  }

  const role = typeof body.role === "string" ? body.role.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const level = standardizeLevel(levelInput);
  if (!SALARY_LEVELS.includes(level as SalaryLevel)) {
    return { ok: false, error: "level or level_standardized must be one of L3, L4, or L5." };
  }

  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (!isValidNumber(body[field])) {
      return { ok: false, error: `${field} must be a valid number.` };
    }
  }

  for (const field of OPTIONAL_NUMBER_FIELDS.filter((field) => field !== "confidence_score")) {
    if (body[field] !== undefined && body[field] !== null && !isValidNumber(body[field])) {
      return { ok: false, error: `${field} must be a valid number.` };
    }
  }

  if (confidenceInput !== undefined && confidenceInput !== null && !isValidNumber(confidenceInput)) {
    return { ok: false, error: "confidence_score or confidence must be a valid number." };
  }

  const baseSalary = toNumber(body.base_salary);
  const bonus = body.bonus === undefined || body.bonus === null ? 0 : toNumber(body.bonus);
  const stock = body.stock === undefined || body.stock === null ? 0 : toNumber(body.stock);
  const confidenceScore =
    confidenceInput === undefined || confidenceInput === null ? 0.75 : toNumber(confidenceInput);

  if (baseSalary < 0 || bonus < 0 || stock < 0) {
    return { ok: false, error: "base_salary, bonus, and stock cannot be negative." };
  }

  const experienceYears = toNumber(body.experience_years);
  if (experienceYears < 0) {
    return { ok: false, error: "experience_years cannot be negative." };
  }

  if (confidenceScore < 0 || confidenceScore > 1) {
    return { ok: false, error: "confidence_score must be between 0 and 1." };
  }

  return {
    ok: true,
    data: {
      company: normalizedCompany,
      role,
      level: level as SalaryLevel,
      location,
      experience_years: experienceYears,
      base_salary: Math.round(baseSalary),
      bonus: Math.round(bonus),
      stock: Math.round(stock),
      total_compensation: Math.round(baseSalary + bonus + stock),
      confidence_score: confidenceScore,
    },
  };
}

export function buildSalaryWhere(filters: SalaryFilters): Prisma.SalaryWhereInput {
  return {
    ...(filters.company
      ? { company: { contains: normalizeCompany(filters.company), mode: "insensitive" } }
      : {}),
    ...(filters.role
      ? { role: { contains: filters.role.trim(), mode: "insensitive" } }
      : {}),
    ...(filters.level
      ? { level: standardizeLevel(filters.level) }
      : {}),
    ...(filters.location
      ? { location: { contains: filters.location.trim(), mode: "insensitive" } }
      : {}),
  };
}

export function duplicateSalaryWhere(salary: SalaryInput): Prisma.SalaryWhereInput {
  return {
    company: salary.company,
    role: salary.role,
    level: salary.level,
    location: salary.location,
    experience_years: salary.experience_years,
    base_salary: salary.base_salary,
    bonus: salary.bonus,
    stock: salary.stock,
    total_compensation: salary.total_compensation,
  };
}

export function parseSortDirection(value: string | null): SortDirection {
  return value === "asc" ? "asc" : "desc";
}

export function salarySearchParams(searchParams: URLSearchParams): SalaryFilters {
  return {
    company: cleanParam(searchParams.get("company")),
    role: cleanParam(searchParams.get("role")),
    level: cleanParam(searchParams.get("level")),
    location: cleanParam(searchParams.get("location")),
  };
}

export function compensationLabel(value: number) {
  return `Rs ${currencyFormatter.format(value / 100000)}L`;
}

export function calculateMedianTotalCompensation(salaries: Pick<Salary, "total_compensation">[]) {
  if (salaries.length === 0) {
    return 0;
  }

  const sorted = salaries
    .map((salary) => salary.total_compensation)
    .sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function calculateLevelDistribution(salaries: Pick<Salary, "level">[]) {
  return SALARY_LEVELS.map((level) => ({
    level,
    count: salaries.filter((salary) => salary.level === level).length,
  }));
}

export function compareSalaries(
  salary1: Pick<Salary, "base_salary" | "bonus" | "stock" | "total_compensation" | "level">,
  salary2: Pick<Salary, "base_salary" | "bonus" | "stock" | "total_compensation" | "level">,
) {
  return {
    base: compareNumbers(salary1.base_salary, salary2.base_salary),
    bonus: compareNumbers(salary1.bonus, salary2.bonus),
    stock: compareNumbers(salary1.stock, salary2.stock),
    total: compareNumbers(salary1.total_compensation, salary2.total_compensation),
    levelDifference: levelRank(salary2.level) - levelRank(salary1.level),
  };
}

function compareNumbers(salary1: number, salary2: number) {
  return {
    salary1,
    salary2,
    difference: salary2 - salary1,
  };
}

function levelRank(level: string) {
  const index = SALARY_LEVELS.findIndex((salaryLevel) => salaryLevel === level);
  return index === -1 ? 0 : index;
}

function isValidNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    return Number.isFinite(Number(value));
  }

  return false;
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

function cleanParam(value: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}
