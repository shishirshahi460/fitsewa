export type Lang = "en" | "ne";
export type Answers = Record<string, unknown>;
export type QuestionType = "single" | "multi" | "number" | "dob" | "consent";
export type ErrorCode = "required" | "invalid" | "too_low" | "too_high" | "minor";

export interface Question {
  readonly id: string;
  readonly section: "A" | "K" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
  readonly type: QuestionType;
  readonly required: boolean;
  readonly options?: readonly string[];
  /** Options that cannot be combined with others (for example none or prefer_not). */
  readonly exclusive?: readonly string[];
  readonly min?: number;
  readonly max?: number;
  readonly unit?: string;
  /** Hidden unless the person agreed to health and lifestyle data processing. */
  readonly requiresConsent?: boolean;
  readonly defaultValue?: unknown;
  readonly showWhen?: (answers: Answers) => boolean;
}