import { CONSENT_TEXT_VERSION, type Answers, type Lang, type PublicUser } from "@fitsewa/shared";
import { api } from "./api";

export interface DraftView {
  step: number;
  consentHealth: boolean | null;
  questionnaireVersion: string;
  expiresAt: string;
  answers: Answers;
}
type Draft = { draft: DraftView };

export const getDraft = () => api<Draft>("/onboarding/drafts/current");
export const createDraft = () => api<Draft>("/onboarding/drafts", { method: "POST" });
export const saveDraft = (answers: Answers, step: number) => api<Draft>("/onboarding/drafts/current", { method: "PATCH", body: { answers, step } });
export const recordConsent = (granted: boolean, locale: Lang) => api<Draft>("/onboarding/drafts/current/consent", { method: "POST", body: { granted, textVersion: CONSENT_TEXT_VERSION, locale } });
export const deleteDraft = () => api<unknown>("/onboarding/drafts/current", { method: "DELETE" });
export const convertDraft = (body: { fullName: string; email: string; password: string; acceptTerms: boolean; marketingOptIn: boolean }) => api<{ user: PublicUser }>("/onboarding/drafts/current/convert", { method: "POST", body });