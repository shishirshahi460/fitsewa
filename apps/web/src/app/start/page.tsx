import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/flow";

export const metadata: Metadata = { title: "Get started | FitSewa", robots: { index: false } };

export default function Start() {
  return <OnboardingFlow />;
}