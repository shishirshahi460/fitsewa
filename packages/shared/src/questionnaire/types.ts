export type Lang = "en" | "ne";
export type Answers = Record<string, unknown>;
export type QuestionType = "single" | "multi" | "number" | "dob" | "consent" | "info";
export type ErrorCode = "required" | "invalid" | "too_low" | "too_high" | "minor" | "wrong_direction" | "bmi_floor";

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
  /** Whole numbers only (for example days per week). */
  readonly integer?: boolean;
  /** Use the grouped food chooser for this multi-select question. */
  readonly picker?: "food";
  /** Hidden unless the person agreed to health and lifestyle data processing. */
  readonly requiresConsent?: boolean;
  readonly defaultValue?: unknown;
  /** Extra rule that can look at other answers (for example the target must match the goal). */
  readonly check?: (value: unknown, answers: Answers) => ErrorCode | null;
  readonly showWhen?: (answers: Answers) => boolean;
}