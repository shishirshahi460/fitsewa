import type { QuestionId } from "./definition.js";
import type { ErrorCode, Lang } from "./types.js";

export interface QuestionCopy {
  title: string;
  help?: string;
  options?: Record<string, string>;
  bullets?: readonly string[];
}

export const copy: Record<Lang, Record<QuestionId, QuestionCopy>> = {
  en: {
    language: { title: "Preferred language", options: { en: "English", ne: "नेपाली" } },
    weight_unit: { title: "Which weight unit do you prefer?", options: { kg: "Kilograms (kg)", lb: "Pounds (lb)" } },
    height_unit: { title: "Which height unit do you prefer?", options: { cm: "Centimetres (cm)", ft_in: "Feet and inches" } },
    date_of_birth: {
      title: "When were you born?",
      help: "FitSewa is for adults aged 18 and over. We use your date of birth to work out your age. Please enter the date in the English (AD) calendar."
    },
    gender: {
      title: "Choose your gender",
      help: "This is optional. You can skip it.",
      options: { female: "Female", male: "Male", non_binary: "Non-binary", prefer_not_to_say: "Prefer not to say" }
    },
    consent_health: {
      title: "Your health and lifestyle information",
      help: "To personalise your plan, we would like to ask about your body, activity, food and health. You choose what to answer.",
      bullets: [
        "We use your answers only to build your FitSewa profile and plan.",
        "We store them with extra protection.",
        "You can skip any optional question.",
        "You can withdraw your consent, and ask to export or delete your data."
      ],
      options: { agree: "I agree", decline: "No thanks, continue without personalising" }
    }
  },
  ne: {
    language: { title: "रुचाइएको भाषा", options: { en: "English", ne: "नेपाली" } },
    weight_unit: { title: "तपाईंलाई कुन तौल इकाई मन पर्छ?", options: { kg: "किलोग्राम (kg)", lb: "पाउन्ड (lb)" } },
    height_unit: { title: "तपाईंलाई कुन उचाइ इकाई मन पर्छ?", options: { cm: "सेन्टिमिटर (cm)", ft_in: "फिट र इन्च" } },
    date_of_birth: {
      title: "तपाईंको जन्म मिति कहिले हो?",
      help: "फिटसेवा १८ वर्ष वा सोभन्दा माथिका वयस्कहरूका लागि हो। तपाईंको उमेर थाहा पाउन हामी जन्म मिति प्रयोग गर्छौं। कृपया अंग्रेजी (ईस्वी) मिति हाल्नुहोस्।"
    },
    gender: {
      title: "तपाईंको लिङ्ग छान्नुहोस्",
      help: "यो ऐच्छिक हो। तपाईं छोड्न सक्नुहुन्छ।",
      options: { female: "महिला", male: "पुरुष", non_binary: "गैरबाइनरी", prefer_not_to_say: "भन्न चाहन्न" }
    },
    consent_health: {
      title: "तपाईंको स्वास्थ्य र जीवनशैलीको जानकारी",
      help: "तपाईंको योजना व्यक्तिगत बनाउन हामी तपाईंको शरीर, गतिविधि, खानपान र स्वास्थ्यबारे सोध्न चाहन्छौं। के उत्तर दिने भन्ने तपाईंको रोजाइ हो।",
      bullets: [
        "तपाईंका उत्तर हामी फिटसेवा प्रोफाइल र योजना बनाउन मात्र प्रयोग गर्छौं।",
        "हामी तिनलाई अतिरिक्त सुरक्षाका साथ राख्छौं।",
        "तपाईं कुनै पनि ऐच्छिक प्रश्न छोड्न सक्नुहुन्छ।",
        "तपाईं सहमति फिर्ता लिन, र आफ्नो डाटा निर्यात वा मेटाउन अनुरोध गर्न सक्नुहुन्छ।"
      ],
      options: { agree: "म सहमत छु", decline: "धन्यवाद, व्यक्तिगत नबनाईकन जारी राख्नुहोस्" }
    }
  }
};

export interface UiCopy {
  back: string; next: string; skip: string; step: string; startAgain: string; restricted: string;
  dobLabel: string; errors: Record<ErrorCode, string>;
  minorTitle: string; minorBody: string;
  declinedTitle: string; declinedBody: string; createAccount: string;
  builtSoFarTitle: string; builtSoFarBody: string;
}

export const ui: Record<Lang, UiCopy> = {
  en: {
    back: "Back", next: "Continue", skip: "Skip", step: "Question {n} of {total}", startAgain: "Start again", restricted: "",
    dobLabel: "Date of birth (AD)",
    errors: { required: "Please choose an answer.", invalid: "Please check this answer.", too_low: "This number is too low.", too_high: "This number is too high.", minor: "FitSewa is for adults aged 18 and over." },
    minorTitle: "FitSewa is for adults (18+)", minorBody: "We cannot continue yet. We have not saved any of your answers.",
    declinedTitle: "No problem", declinedBody: "You can still create a FitSewa account. We will not personalise your plan.", createAccount: "Create an account",
    builtSoFarTitle: "Development preview", builtSoFarBody: "Only Section A and the consent screen are built so far. The next sections arrive in the following steps."
  },
  ne: {
    back: "पछाडि", next: "अगाडि बढ्नुहोस्", skip: "छोड्नुहोस्", step: "प्रश्न {n} / {total}", startAgain: "फेरि सुरु गर्नुहोस्", restricted: "",
    dobLabel: "जन्म मिति (ईस्वी)",
    errors: { required: "कृपया उत्तर छान्नुहोस्।", invalid: "कृपया यो उत्तर जाँच गर्नुहोस्।", too_low: "यो संख्या धेरै सानो छ।", too_high: "यो संख्या धेरै ठूलो छ।", minor: "फिटसेवा १८ वर्ष वा सोभन्दा माथिका वयस्कहरूका लागि हो।" },
    minorTitle: "फिटसेवा वयस्क (१८+) का लागि हो", minorBody: "हामी अहिले अगाडि बढ्न सक्दैनौं। तपाईंका कुनै पनि उत्तर हामीले सुरक्षित गरेका छैनौं।",
    declinedTitle: "ठीक छ", declinedBody: "तपाईं अझै फिटसेवा खाता बनाउन सक्नुहुन्छ। हामी तपाईंको योजना व्यक्तिगत बनाउने छैनौं।", createAccount: "खाता बनाउनुहोस्",
    builtSoFarTitle: "विकास पूर्वावलोकन", builtSoFarBody: "अहिलेसम्म खण्ड A र सहमति स्क्रिन मात्र बनेको छ। अरू खण्डहरू आगामी चरणमा आउँछन्।"
  }
};