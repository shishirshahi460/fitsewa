import type { Lang } from "./types.js";

export interface SaveUi {
  privacyNote: string; saved: string; saveFailed: string; deleteSaved: string;
  welcomeBack: string; welcomeBody: string; continueSaved: string; startFresh: string;
}

export const saveUi: Record<Lang, SaveUi> = {
  en: {
    privacyNote: "If you continue, your answers are saved on our server so you can come back later. They are deleted after 7 days without use, and you can delete them yourself at any time.",
    saved: "Saved", saveFailed: "We could not save your answers. They are still on this screen.", deleteSaved: "Delete my saved answers",
    welcomeBack: "Welcome back", welcomeBody: "You have answers saved from earlier. Would you like to carry on where you left off?",
    continueSaved: "Continue where I left off", startFresh: "Start again and delete my saved answers"
  },
  ne: {
    privacyNote: "तपाईं अगाडि बढ्नुभयो भने तपाईंका उत्तर हाम्रो सर्भरमा सुरक्षित गरिन्छन्, ताकि तपाईं पछि फर्कन सक्नुहुन्छ। ७ दिनसम्म प्रयोग नगरे ती मेटिन्छन्, र तपाईं आफैं जुनसुकै बेला मेट्न सक्नुहुन्छ।",
    saved: "सुरक्षित गरियो", saveFailed: "हामीले तपाईंका उत्तर सुरक्षित गर्न सकेनौं। तिनीहरू यही स्क्रिनमा छन्।", deleteSaved: "मेरा सुरक्षित उत्तर मेटाउनुहोस्",
    welcomeBack: "फेरि स्वागत छ", welcomeBody: "तपाईंका उत्तर पहिले सुरक्षित गरिएका छन्। के तपाईं छोडेको ठाउँबाट अगाडि बढ्न चाहनुहुन्छ?",
    continueSaved: "छोडेको ठाउँबाट अगाडि बढ्नुहोस्", startFresh: "फेरि सुरु गर्नुहोस् र मेरा सुरक्षित उत्तर मेटाउनुहोस्"
  }
};