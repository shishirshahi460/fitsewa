import type { QuestionId } from "./definition.js";
import { moreCopy, type MoreId } from "./copy-more.js";
import { foodLabels } from "./foods.js";
import type { ErrorCode, Lang } from "./types.js";

export interface QuestionCopy {
  title: string;
  help?: string;
  options?: Record<string, string>;
  bullets?: readonly string[];
}

const baseCopy: Record<Lang, Record<Exclude<QuestionId, MoreId>, QuestionCopy>> = {
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
    },
    primary_goal: {
      title: "What is your main goal?",
      options: {
        lose_weight: "Lose weight", gain_weight: "Gain weight", maintain_weight: "Maintain my weight", build_muscle: "Build muscle",
        improve_strength: "Improve strength", improve_stamina: "Improve stamina and endurance", improve_mobility: "Improve flexibility and mobility",
        improve_overall_fitness: "Improve overall fitness", improve_nutrition: "Eat healthier", undecided: "I have not decided yet"
      }
    },
    height_cm: { title: "What is your height?" },
    weight_kg: { title: "What is your current weight?" },
    energy_basis: {
      title: "Which formula basis fits you best for energy estimates?",
      help: "Energy formulas use different constants for female and male bodies. This is separate from your gender above and is optional. If you skip, we use an average.",
      options: { female_based: "Female-based", male_based: "Male-based", average: "Average", prefer_not: "Prefer not to say" }
    },
    target_weight_kg: { title: "What is your target weight?", help: "You can change this later." },
    timeframe: {
      title: "How long would you like to take?",
      help: "A steady pace is easier to keep. We do not promise results or dates.",
      options: { "12_weeks": "About 12 weeks", "6_months": "About 6 months", "12_months": "About 12 months", flexible: "No fixed time" }
    },
    prior_weight_experience: {
      title: "Have you tried to manage your weight before?",
      options: { none: "No, this is my first time", tried_alone: "Yes, on my own", tried_with_professional: "Yes, with a professional" }
    },
    waist_cm: { title: "What is your waist measurement?", help: "Optional. Measure around your waist, level with your belly button." },
    hip_cm: { title: "What is your hip measurement?", help: "Optional. Measure around the widest part of your hips." },
    bmi_summary: {
      title: "Your body mass index",
      help: "BMI is your weight in kilograms divided by your height in metres squared. It is only a rough screening measure, not a diagnosis. It cannot tell muscle from fat, and it varies with age and body type. Please talk to a healthcare professional about your health."
    },
    activity_level: {
      title: "How active are you in a typical week?",
      options: {
        not_active: "Not active: mostly sitting, little or no exercise", lightly_active: "Lightly active: light exercise 1 to 3 days a week",
        moderately_active: "Moderately active: exercise 3 to 5 days a week", active: "Active: hard exercise 6 to 7 days a week",
        very_active: "Very active: hard exercise every day, or a physical job"
      }
    },
    daily_walking: {
      title: "About how much do you walk each day?",
      options: { under_3k: "Under 3,000 steps", "3k_6k": "3,000 to 6,000 steps", "6k_9k": "6,000 to 9,000 steps", over_9k: "More than 9,000 steps", not_sure: "I am not sure" }
    },
    exercise_days: { title: "On how many days a week do you exercise?", help: "Enter a number from 0 to 7." },
    sitting_hours: {
      title: "How long do you sit each day?",
      options: { under_4: "Under 4 hours", "4_6": "4 to 6 hours", "6_8": "6 to 8 hours", over_8: "More than 8 hours" }
    },
    occupation: {
      title: "What best describes your daily routine?",
      options: {
        student: "Student", office_worker: "Office worker", business_owner: "Business owner", shift_worker: "Shift worker",
        manual_work: "Physical or manual work", homemaker: "Homemaker", unemployed: "Not currently working", retired: "Retired", other: "Something else"
      }
    },
    work_hours: {
      title: "How many hours do you work or study each day?",
      options: { under_4: "Under 4 hours", "4_8": "4 to 8 hours", "8_10": "8 to 10 hours", over_10: "More than 10 hours" }
    },
    exercise_time_min: {
      title: "How much time can you give to exercise on a day you train?",
      options: { "15": "15 minutes", "30": "30 minutes", "45": "45 minutes", "60": "1 hour", "90_plus": "More than 1 hour" }
    },
    exercise_setting: {
      title: "Where do you like to exercise?", help: "Choose all that apply.",
      options: { home: "At home", gym: "At a gym", outdoor: "Outdoors" }
    },
    sleep_quality: { title: "How would you describe your sleep?", options: { poor: "Poor", fair: "Fair", good: "Good", very_good: "Very good" } },
    sleep_hours: { title: "How many hours do you usually sleep each night?", help: "You can use halves, for example 6.5." },
    water_glasses: { title: "How many glasses of water do you drink each day?", help: "One glass is about 250 ml." },
    weekend_eating: {
      title: "How does your eating change at weekends?",
      options: { same: "About the same as weekdays", a_bit_more: "A bit more than weekdays", much_more: "Much more than weekdays", less: "Less than weekdays" }
    },
    meal_timing: {
      title: "How regular are your meal times?",
      options: { regular: "Very regular", mostly_regular: "Mostly regular", irregular: "Irregular" }
    },
    eating_pattern: {
      title: "How would you describe your eating habits?",
      options: {
        same_daily: "I eat the same food every day", some_variation: "I eat similar foods with some variation",
        rotate_familiar: "I rotate between familiar foods", enjoy_experimenting: "I enjoy trying different foods"
      }
    },
    cooking_skill: {
      title: "How would you describe your cooking skills?",
      options: { experienced: "Experienced cook", basic: "Basic cooking skills", learning: "Learning to cook", cannot_cook: "I cannot cook" }
    },
    cooking_time: {
      title: "How much time can you spend cooking each day?",
      options: { under_20: "Under 20 minutes", "20_45": "20 to 45 minutes", over_45: "More than 45 minutes" }
    },
    diet_type: {
      title: "What type of diet do you follow?",
      options: {
        vegetarian: "Vegetarian", non_vegetarian: "Non-vegetarian", vegan: "Vegan (no animal products)",
        eggetarian: "Eggetarian (vegetarian who eats eggs)", pescatarian: "Pescatarian (fish, but no other meat)", no_preference: "No specific preference"
      }
    },
    liked_foods: { title: "Which foods do you enjoy?", help: "Choose as many or as few as you like. You can skip this.", options: foodLabels("en") },
    disliked_foods: { title: "Which foods do you dislike or avoid?", help: "Foods you chose as liked are not shown here.", options: foodLabels("en") },
    frequent_meals: { title: "Which foods do you eat most often?", help: "Choose the ones you eat every week.", options: foodLabels("en") }
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
    },
    primary_goal: {
      title: "तपाईंको मुख्य लक्ष्य के हो?",
      options: {
        lose_weight: "तौल घटाउने", gain_weight: "तौल बढाउने", maintain_weight: "अहिलेको तौल कायम राख्ने", build_muscle: "मांसपेशी बनाउने",
        improve_strength: "शक्ति बढाउने", improve_stamina: "सहनशक्ति र स्टामिना बढाउने", improve_mobility: "लचिलोपन र चाल सुधार्ने",
        improve_overall_fitness: "समग्र फिटनेस सुधार्ने", improve_nutrition: "स्वस्थ खानपान अपनाउने", undecided: "मैले अझै निर्णय गरेको छैन"
      }
    },
    height_cm: { title: "तपाईंको उचाइ कति हो?" },
    weight_kg: { title: "तपाईंको हालको तौल कति हो?" },
    energy_basis: {
      title: "ऊर्जा अनुमानका लागि कुन आधार तपाईंलाई मिल्छ?",
      help: "ऊर्जा सूत्रहरूले महिला र पुरुष शरीरका लागि फरक मान प्रयोग गर्छन्। यो माथिको लिङ्गभन्दा फरक र ऐच्छिक हो। छोडेमा हामी औसत प्रयोग गर्छौं।",
      options: { female_based: "महिला आधारित", male_based: "पुरुष आधारित", average: "औसत", prefer_not: "भन्न चाहन्न" }
    },
    target_weight_kg: { title: "तपाईंको लक्षित तौल कति हो?", help: "तपाईं यो पछि परिवर्तन गर्न सक्नुहुन्छ।" },
    timeframe: {
      title: "तपाईं कति समय लिन चाहनुहुन्छ?",
      help: "स्थिर गतिमा गर्दा निरन्तरता कायम राख्न सजिलो हुन्छ। हामी नतिजा वा मिति प्रतिज्ञा गर्दैनौं।",
      options: { "12_weeks": "करिब १२ हप्ता", "6_months": "करिब ६ महिना", "12_months": "करिब १२ महिना", flexible: "निश्चित समय छैन" }
    },
    prior_weight_experience: {
      title: "के तपाईंले पहिले तौल व्यवस्थापन गर्ने प्रयास गर्नुभएको छ?",
      options: { none: "छैन, यो पहिलो पटक हो", tried_alone: "छ, आफैंले", tried_with_professional: "छ, विशेषज्ञको साथमा" }
    },
    waist_cm: { title: "तपाईंको कम्मरको नाप कति हो?", help: "ऐच्छिक। नाभिकै तहमा कम्मरको वरिपरि नाप्नुहोस्।" },
    hip_cm: { title: "तपाईंको कुल्हाको नाप कति हो?", help: "ऐच्छिक। कुल्हाको सबैभन्दा चौडा भागको वरिपरि नाप्नुहोस्।" },
    bmi_summary: {
      title: "तपाईंको बडी मास इन्डेक्स (BMI)",
      help: "BMI भनेको किलोग्राममा तौललाई मिटरमा उचाइको वर्गले भाग गरेको संख्या हो। यो मोटामोटी जाँच मात्र हो, निदान होइन। यसले मांसपेशी र बोसो छुट्याउन सक्दैन, र उमेर तथा शरीरको बनोटअनुसार फरक पर्छ। आफ्नो स्वास्थ्यबारे कृपया स्वास्थ्य विशेषज्ञसँग कुरा गर्नुहोस्।"
    },
    activity_level: {
      title: "सामान्य हप्तामा तपाईं कत्तिको सक्रिय हुनुहुन्छ?",
      options: {
        not_active: "निष्क्रिय: धेरैजसो बस्ने, व्यायाम थोरै वा नगर्ने", lightly_active: "हल्का सक्रिय: हप्तामा १ देखि ३ दिन हल्का व्यायाम",
        moderately_active: "मध्यम सक्रिय: हप्तामा ३ देखि ५ दिन व्यायाम", active: "सक्रिय: हप्तामा ६ देखि ७ दिन कडा व्यायाम",
        very_active: "धेरै सक्रिय: दिनहुँ कडा व्यायाम, वा शारीरिक काम"
      }
    },
    daily_walking: {
      title: "तपाईं दिनमा करिब कति हिँड्नुहुन्छ?",
      options: { under_3k: "३,००० पाइलाभन्दा कम", "3k_6k": "३,००० देखि ६,००० पाइला", "6k_9k": "६,००० देखि ९,००० पाइला", over_9k: "९,००० पाइलाभन्दा बढी", not_sure: "मलाई थाहा छैन" }
    },
    exercise_days: { title: "हप्तामा कति दिन व्यायाम गर्नुहुन्छ?", help: "० देखि ७ सम्मको संख्या हाल्नुहोस्।" },
    sitting_hours: {
      title: "तपाईं दिनमा कति बेर बस्नुहुन्छ?",
      options: { under_4: "४ घण्टाभन्दा कम", "4_6": "४ देखि ६ घण्टा", "6_8": "६ देखि ८ घण्टा", over_8: "८ घण्टाभन्दा बढी" }
    },
    occupation: {
      title: "तपाईंको दैनिक काम कुन कुरासँग सबैभन्दा मिल्छ?",
      options: {
        student: "विद्यार्थी", office_worker: "कार्यालयमा काम गर्ने", business_owner: "व्यवसायी", shift_worker: "पालो (शिफ्ट) मा काम गर्ने",
        manual_work: "शारीरिक श्रमको काम", homemaker: "घरेलु काम गर्ने", unemployed: "अहिले काम नगरेको", retired: "अवकाशप्राप्त", other: "अन्य"
      }
    },
    work_hours: {
      title: "तपाईं दिनमा कति घण्टा काम वा अध्ययन गर्नुहुन्छ?",
      options: { under_4: "४ घण्टाभन्दा कम", "4_8": "४ देखि ८ घण्टा", "8_10": "८ देखि १० घण्टा", over_10: "१० घण्टाभन्दा बढी" }
    },
    exercise_time_min: {
      title: "व्यायाम गर्ने दिन तपाईं कति समय दिन सक्नुहुन्छ?",
      options: { "15": "१५ मिनेट", "30": "३० मिनेट", "45": "४५ मिनेट", "60": "१ घण्टा", "90_plus": "१ घण्टाभन्दा बढी" }
    },
    exercise_setting: {
      title: "तपाईंलाई कहाँ व्यायाम गर्न मन पर्छ?", help: "लागू हुने सबै छान्नुहोस्।",
      options: { home: "घरमा", gym: "जिममा", outdoor: "बाहिर खुला ठाउँमा" }
    },
    sleep_quality: { title: "तपाईंको निद्रा कस्तो छ?", options: { poor: "कमजोर", fair: "ठीकठाक", good: "राम्रो", very_good: "धेरै राम्रो" } },
    sleep_hours: { title: "तपाईं सामान्यतया रातमा कति घण्टा सुत्नुहुन्छ?", help: "आधा घण्टा पनि हाल्न सकिन्छ, जस्तै ६.५।" },
    water_glasses: { title: "तपाईं दिनमा कति गिलास पानी पिउनुहुन्छ?", help: "एक गिलास करिब २५० मि.लि. हुन्छ।" },
    weekend_eating: {
      title: "सप्ताहान्तमा तपाईंको खानपान कस्तो फरक हुन्छ?",
      options: { same: "हप्ताका अरू दिनजस्तै", a_bit_more: "अरू दिनभन्दा अलि बढी", much_more: "अरू दिनभन्दा निकै बढी", less: "अरू दिनभन्दा कम" }
    },
    meal_timing: {
      title: "तपाईंको खाना खाने समय कत्तिको नियमित छ?",
      options: { regular: "धेरै नियमित", mostly_regular: "प्रायः नियमित", irregular: "अनियमित" }
    },
    eating_pattern: {
      title: "तपाईंको खानपानको बानी कस्तो छ?",
      options: {
        same_daily: "म हरेक दिन उही खाना खान्छु", some_variation: "म उस्तै खाना खान्छु, केही फरकसहित",
        rotate_familiar: "म चिनेका खानाहरू पालैपालो खान्छु", enjoy_experimenting: "मलाई फरक फरक खाना चाखेर हेर्न मन पर्छ"
      }
    },
    cooking_skill: {
      title: "तपाईं खाना कत्तिको पकाउन सक्नुहुन्छ?",
      options: { experienced: "अनुभवी कुक", basic: "आधारभूत पकाउने सीप", learning: "पकाउन सिक्दै", cannot_cook: "म पकाउन सक्दिनँ" }
    },
    cooking_time: {
      title: "तपाईं दिनमा खाना पकाउन कति समय दिन सक्नुहुन्छ?",
      options: { under_20: "२० मिनेटभन्दा कम", "20_45": "२० देखि ४५ मिनेट", over_45: "४५ मिनेटभन्दा बढी" }
    },
    diet_type: {
      title: "तपाईं कस्तो आहार पालना गर्नुहुन्छ?",
      options: {
        vegetarian: "शाकाहारी", non_vegetarian: "मांसाहारी", vegan: "भेगन (कुनै पनि पशुजन्य नखाने)",
        eggetarian: "अण्डा खाने शाकाहारी", pescatarian: "माछा खाने, अन्य मासु नखाने", no_preference: "कुनै विशेष रुचि छैन"
      }
    },
    liked_foods: { title: "तपाईंलाई कुन कुन खाना मन पर्छ?", help: "जति मन लाग्छ उति छान्नुहोस्। तपाईं यो छोड्न सक्नुहुन्छ।", options: foodLabels("ne") },
    disliked_foods: { title: "तपाईंलाई कुन कुन खाना मन पर्दैन वा तपाईं नखाने?", help: "मन पर्ने भनेर छानेका खाना यहाँ देखिँदैनन्।", options: foodLabels("ne") },
    frequent_meals: { title: "तपाईं सबैभन्दा धेरै कुन खाना खानुहुन्छ?", help: "हरेक हप्ता खाने खाना छान्नुहोस्।", options: foodLabels("ne") }
  }
};

export const copy: Record<Lang, Record<QuestionId, QuestionCopy>> = {
  en: { ...baseCopy.en, ...moreCopy.en },
  ne: { ...baseCopy.ne, ...moreCopy.ne }
};

export interface UiCopy {
  back: string; next: string; skip: string; step: string; startAgain: string;
  dobLabel: string; errors: Record<ErrorCode, string>;
  minorTitle: string; minorBody: string;
  declinedTitle: string; declinedBody: string; createAccount: string;
  builtSoFarTitle: string; builtSoFarBody: string;
  feet: string; inches: string; bmiLabel: string; bmiScale: string;
  currentLabel: string; targetLabel: string; differenceLabel: string; paceHint: string;
}

export const ui: Record<Lang, UiCopy> = {
  en: {
    back: "Back", next: "Continue", skip: "Skip", step: "Question {n} of {total}", startAgain: "Start again",
    dobLabel: "Date of birth (AD)",
    errors: {
      required: "Please choose an answer.", invalid: "Please check this answer.", too_low: "This number is too low.", too_high: "This number is too high.",
      minor: "FitSewa is for adults aged 18 and over.", wrong_direction: "Your target does not match your goal. Please check it.",
      bmi_floor: "This target is too low to be safe. Please choose a higher target."
    },
    minorTitle: "FitSewa is for adults (18+)", minorBody: "We cannot continue yet. We have not saved any of your answers.",
    declinedTitle: "No problem", declinedBody: "You can still create a FitSewa account. We will not personalise your plan.", createAccount: "Create an account",
    builtSoFarTitle: "Development preview", builtSoFarBody: "All question sections (A to I) are built. The summary, plan preview and account step come next.",
    feet: "Feet", inches: "Inches", bmiLabel: "BMI", bmiScale: "BMI on a scale from 15 to 40",
    currentLabel: "Current weight", targetLabel: "Target weight", differenceLabel: "Difference",
    paceHint: "That is faster than the pace we recommend. We will plan for a gentler pace."
  },
  ne: {
    back: "पछाडि", next: "अगाडि बढ्नुहोस्", skip: "छोड्नुहोस्", step: "प्रश्न {n} / {total}", startAgain: "फेरि सुरु गर्नुहोस्",
    dobLabel: "जन्म मिति (ईस्वी)",
    errors: {
      required: "कृपया उत्तर छान्नुहोस्।", invalid: "कृपया यो उत्तर जाँच गर्नुहोस्।", too_low: "यो संख्या धेरै सानो छ।", too_high: "यो संख्या धेरै ठूलो छ।",
      minor: "फिटसेवा १८ वर्ष वा सोभन्दा माथिका वयस्कहरूका लागि हो।", wrong_direction: "तपाईंको लक्ष्य र लक्षित तौल मिलेन। कृपया जाँच गर्नुहोस्।",
      bmi_floor: "यो लक्षित तौल सुरक्षित हुनका लागि धेरै कम छ। कृपया अलि बढी लक्षित तौल छान्नुहोस्।"
    },
    minorTitle: "फिटसेवा वयस्क (१८+) का लागि हो", minorBody: "हामी अहिले अगाडि बढ्न सक्दैनौं। तपाईंका कुनै पनि उत्तर हामीले सुरक्षित गरेका छैनौं।",
    declinedTitle: "ठीक छ", declinedBody: "तपाईं अझै फिटसेवा खाता बनाउन सक्नुहुन्छ। हामी तपाईंको योजना व्यक्तिगत बनाउने छैनौं।", createAccount: "खाता बनाउनुहोस्",
    builtSoFarTitle: "विकास पूर्वावलोकन", builtSoFarBody: "सबै प्रश्न खण्ड (A देखि I) बनिसकेका छन्। सारांश, योजना पूर्वावलोकन र खाता बनाउने चरण अब आउँछन्।",
    feet: "फिट", inches: "इन्च", bmiLabel: "BMI", bmiScale: "१५ देखि ४० सम्मको BMI स्केल",
    currentLabel: "हालको तौल", targetLabel: "लक्षित तौल", differenceLabel: "फरक",
    paceHint: "यो हामीले सिफारिस गरेको गतिभन्दा छिटो छ। हामी बढी सहज गतिमा योजना बनाउँछौं।"
  }
};