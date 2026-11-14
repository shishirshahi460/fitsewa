import type { Lang } from "./types.js";

export interface AccountUi {
  title: string; intro: string; fullName: string; email: string; password: string; passwordHint: string; confirm: string;
  terms: string; marketing: string; submit: string; working: string; mismatch: string; haveAccount: string; signIn: string;
  noDraftTitle: string; noDraftBody: string; startOver: string; dobMissing: string;
}

export const accountUi: Record<Lang, AccountUi> = {
  en: {
    title: "Create your account", intro: "Your answers are saved. Create an account to keep them and come back any time.",
    fullName: "Full name", email: "Email", password: "Password", passwordHint: "At least 10 characters.", confirm: "Confirm password",
    terms: "I agree to the FitSewa terms and privacy notice (draft, to be published before launch).",
    marketing: "I would like to receive FitSewa tips and updates by email (optional).",
    submit: "Create account", working: "Please wait...", mismatch: "The two passwords do not match.",
    haveAccount: "Already have an account?", signIn: "Sign in",
    noDraftTitle: "We could not find your saved answers", noDraftBody: "They may have been deleted or expired after 7 days. You can start again, or create an account without a plan.",
    startOver: "Start again", dobMissing: "Please answer the first questions, including your date of birth, before creating an account."
  },
  ne: {
    title: "आफ्नो खाता बनाउनुहोस्", intro: "तपाईंका उत्तर सुरक्षित गरिएका छन्। तिनलाई राख्न र जुनसुकै बेला फर्कन खाता बनाउनुहोस्।",
    fullName: "पूरा नाम", email: "इमेल", password: "पासवर्ड", passwordHint: "कम्तीमा १० अक्षर।", confirm: "पासवर्ड पुष्टि गर्नुहोस्",
    terms: "म फिटसेवाको सर्त र गोपनीयता सूचनासँग सहमत छु (मस्यौदा, सुरु गर्नुअघि प्रकाशित हुनेछ)।",
    marketing: "म फिटसेवाका सुझाव र अपडेट इमेलमार्फत पाउन चाहन्छु (ऐच्छिक)।",
    submit: "खाता बनाउनुहोस्", working: "कृपया पर्खनुहोस्...", mismatch: "दुई पासवर्ड मिलेन।",
    haveAccount: "पहिले नै खाता छ?", signIn: "साइन इन गर्नुहोस्",
    noDraftTitle: "हामीले तपाईंका सुरक्षित उत्तर भेट्टाएनौं", noDraftBody: "ती मेटिएका वा ७ दिनपछि सकिएका हुन सक्छन्। तपाईं फेरि सुरु गर्न सक्नुहुन्छ, वा योजना बिना खाता बनाउन सक्नुहुन्छ।",
    startOver: "फेरि सुरु गर्नुहोस्", dobMissing: "खाता बनाउनुअघि कृपया सुरुका प्रश्नहरू, जन्म मिति सहित, उत्तर दिनुहोस्।"
  }
};