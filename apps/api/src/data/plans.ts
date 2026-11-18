/** Starter plans. DRAFT: not reviewed by a qualified fitness professional. They are examples to start from, not prescriptions. */
export interface SeedPlan {
  slug: string; nameEn: string; nameNe: string; level: "beginner" | "intermediate" | "advanced"; place: "home" | "gym" | "outdoor";
  goal: string; daysPerWeek: number; descriptionEn: string;
  sessions: { name: string; items: { exerciseSlug: string; sets?: number; reps?: number; seconds?: number; minutes?: number }[] }[];
}

export const PLANS_SEED: SeedPlan[] = [
  { slug: "beginner-home-full-body", nameEn: "Beginner home full body", nameNe: "सुरुवातीका लागि घरमै पूरा शरीर", level: "beginner", place: "home", goal: "General fitness", daysPerWeek: 3,
    descriptionEn: "Two simple sessions, alternated on three non-consecutive days a week. Rest at least a day between sessions.",
    sessions: [
      { name: "Session A", items: [{ exerciseSlug: "chair-squat", sets: 2, reps: 10 }, { exerciseSlug: "wall-pushup", sets: 2, reps: 10 }, { exerciseSlug: "glute-bridge", sets: 2, reps: 10 }, { exerciseSlug: "plank", sets: 2, seconds: 20 }] },
      { name: "Session B", items: [{ exerciseSlug: "bodyweight-squat", sets: 2, reps: 8 }, { exerciseSlug: "knee-pushup", sets: 2, reps: 6 }, { exerciseSlug: "bird-dog", sets: 2, reps: 8 }, { exerciseSlug: "wall-sit", sets: 2, seconds: 20 }] }
    ] },
  { slug: "beginner-walking", nameEn: "Beginner walking plan", nameNe: "सुरुवातीका लागि हिँडाइ योजना", level: "beginner", place: "outdoor", goal: "Stamina and everyday fitness", daysPerWeek: 4,
    descriptionEn: "Build up gradually. Add a few minutes each week as it feels comfortable.",
    sessions: [
      { name: "Easy walk", items: [{ exerciseSlug: "brisk-walk", minutes: 20 }] },
      { name: "Steady walk", items: [{ exerciseSlug: "brisk-walk", minutes: 30 }] }
    ] },
  { slug: "home-strength-intermediate", nameEn: "Home strength, intermediate", nameNe: "घरमै शक्ति (मध्यम स्तर)", level: "intermediate", place: "home", goal: "Strength", daysPerWeek: 3,
    descriptionEn: "Bodyweight strength with three sets. Rest 60 to 90 seconds between sets.",
    sessions: [{ name: "Full body", items: [{ exerciseSlug: "pushup", sets: 3, reps: 8 }, { exerciseSlug: "reverse-lunge", sets: 3, reps: 8 }, { exerciseSlug: "glute-bridge", sets: 3, reps: 12 }, { exerciseSlug: "plank", sets: 3, seconds: 30 }, { exerciseSlug: "bird-dog", sets: 3, reps: 10 }] }] },
  { slug: "gym-beginner-full-body", nameEn: "Gym beginner full body", nameNe: "जिम सुरुवाती पूरा शरीर", level: "beginner", place: "gym", goal: "Strength and muscle", daysPerWeek: 3,
    descriptionEn: "Ask a gym trainer to check your technique on the first day. Start with light weights.",
    sessions: [{ name: "Full body", items: [{ exerciseSlug: "goblet-squat", sets: 3, reps: 10 }, { exerciseSlug: "dumbbell-row", sets: 3, reps: 10 }, { exerciseSlug: "dumbbell-shoulder-press", sets: 2, reps: 10 }, { exerciseSlug: "lat-pulldown", sets: 3, reps: 10 }, { exerciseSlug: "plank", sets: 2, seconds: 30 }] }] },
  { slug: "gentle-yoga-mobility", nameEn: "Gentle yoga and mobility", nameNe: "सजिलो योग र लचिलोपन", level: "beginner", place: "home", goal: "Flexibility and mobility", daysPerWeek: 4,
    descriptionEn: "Slow, gentle movement. Hold each stretch for about 30 seconds and breathe steadily.",
    sessions: [{ name: "Gentle routine", items: [{ exerciseSlug: "cat-cow", sets: 1, reps: 10 }, { exerciseSlug: "childs-pose", sets: 1, seconds: 30 }, { exerciseSlug: "downward-dog", sets: 1, seconds: 30 }, { exerciseSlug: "hamstring-stretch", sets: 2, seconds: 30 }, { exerciseSlug: "hip-flexor-stretch", sets: 2, seconds: 30 }] }] },
  { slug: "cardio-starter", nameEn: "Cardio starter", nameNe: "कार्डियो सुरुवात", level: "beginner", place: "outdoor", goal: "Stamina", daysPerWeek: 3,
    descriptionEn: "Three different sessions to keep things interesting. Keep the effort comfortable.",
    sessions: [
      { name: "Walk", items: [{ exerciseSlug: "brisk-walk", minutes: 25 }] },
      { name: "Bike", items: [{ exerciseSlug: "cycling", minutes: 20 }] },
      { name: "Stairs and jacks", items: [{ exerciseSlug: "stair-climbing", minutes: 10 }, { exerciseSlug: "jumping-jacks", sets: 3, seconds: 30 }] }
    ] }
];