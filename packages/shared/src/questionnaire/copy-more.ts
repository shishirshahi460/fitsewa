import type { QuestionCopy } from "./copy.js";
import type { Lang } from "./types.js";

export type MoreId =
  | "allergies" | "dietary_requirements" | "food_budget" | "eating_out"
  | "health_section_opt_in" | "conditions" | "takes_medication" | "activity_restricted" | "mobility_limitation"
  | "needs_assistance" | "energy_level" | "pregnancy_breastfeeding" | "caution_notice" | "pregnancy_notice"
  | "experience_level" | "preferred_exercise" | "equipment" | "workout_minutes" | "workout_days" | "intensity"
  | "extra_goals" | "past_attempts" | "motivation_level" | "support_style";

export const moreCopy: Record<Lang, Record<MoreId, QuestionCopy>> = {
  en: {
    allergies: {
      title: "Do you have any food allergies or intolerances?",
      help: "We take this seriously. We will not suggest foods that contain what you choose here.",
      options: {
        lactose: "Lactose (milk sugar)", milk_protein: "Milk protein", nuts: "Nuts", eggs: "Eggs", fish: "Fish", seafood: "Shellfish and seafood",
        gluten: "Gluten", soy: "Soy", other: "Something else", none: "None of these", prefer_not_to_answer: "Prefer not to answer"
      }
    },
    dietary_requirements: {
      title: "Do you follow any religious or personal food rules?", help: "Optional. Only share this if you want to.",
      options: { no_beef: "No beef", no_pork: "No pork", no_alcohol: "No alcohol", fasting_periods: "I fast at certain times", other: "Something else" }
    },
    food_budget: {
      title: "How would you describe your food budget?",
      options: { low: "Low, I need affordable options", medium: "Medium", flexible: "Flexible" }
    },
    eating_out: {
      title: "How often do you eat out?",
      options: { never: "Almost never", weekly_1_2: "1 to 2 times a week", weekly_3_5: "3 to 5 times a week", daily: "Every day" }
    },
    health_section_opt_in: {
      title: "Would you like to add health information?",
      help: "This is optional. We ask only simple yes or no questions. We do not ask for medication names or medical details, and we do not diagnose or treat anything. You can say no and still use FitSewa.",
      options: { yes: "Yes, add it", no: "No, skip this part" }
    },
    conditions: {
      title: "Do you have any diagnosed health conditions?", help: "Choose any that a doctor has told you about. You can skip this.",
      options: {
        high_blood_pressure: "High blood pressure", heart_disease: "Heart disease", high_cholesterol: "High cholesterol", diabetes: "Diabetes",
        kidney_disease: "Kidney disease", osteoarthritis: "Osteoarthritis", other: "Another condition", none: "None of these", prefer_not: "Prefer not to answer"
      }
    },
    takes_medication: {
      title: "Are you currently taking any regular medication?", help: "Yes or no only. Please do not tell us the names.",
      options: { yes: "Yes", no: "No", prefer_not: "Prefer not to answer" }
    },
    activity_restricted: {
      title: "Has a doctor told you to limit physical activity?",
      options: { yes: "Yes", no: "No", prefer_not: "Prefer not to answer" }
    },
    mobility_limitation: {
      title: "Do you have any difficulty moving around?",
      options: { none: "No difficulty", some: "Some difficulty", significant: "A lot of difficulty", prefer_not: "Prefer not to answer" }
    },
    needs_assistance: {
      title: "Do you need help with daily physical activities?",
      options: { yes: "Yes", no: "No", prefer_not: "Prefer not to answer" }
    },
    energy_level: {
      title: "How are your energy levels most days?",
      options: { "1": "Very low", "2": "Low", "3": "Medium", "4": "Good", "5": "Very good" }
    },
    pregnancy_breastfeeding: {
      title: "Are you pregnant or breastfeeding?", help: "We ask only so we never suggest eating less during this time.",
      options: { yes: "Yes", no: "No", prefer_not: "Prefer not to answer" }
    },
    caution_notice: {
      title: "Thank you for telling us",
      help: "Because of what you shared, we will give general information only. Please talk to a qualified healthcare professional before you change your diet or start a new exercise routine. FitSewa does not diagnose or treat any condition."
    },
    pregnancy_notice: {
      title: "During pregnancy or breastfeeding",
      help: "We will not suggest eating less or losing weight during this time. Please follow the advice of your doctor or health worker."
    },
    experience_level: {
      title: "How experienced are you with exercise?",
      options: { complete_beginner: "Complete beginner", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", athlete: "Experienced athlete" }
    },
    preferred_exercise: {
      title: "What kinds of exercise do you prefer?", help: "Choose all that apply.",
      options: {
        gym: "Gym workouts", home: "Home workouts", walking: "Walking", running: "Running", cycling: "Cycling", swimming: "Swimming",
        yoga: "Yoga", strength: "Strength training", cardio: "Cardio", outdoor: "Outdoor activities", hiking_trekking: "Hiking and trekking"
      }
    },
    equipment: {
      title: "What equipment do you have?", help: "Choose all that apply.",
      options: {
        none: "None", dumbbells: "Dumbbells", resistance_bands: "Resistance bands", bench_barbell: "Bench and barbell", full_gym: "Full gym access",
        yoga_mat: "Yoga mat", bicycle: "Bicycle", treadmill: "Treadmill"
      }
    },
    workout_minutes: {
      title: "How long would you like each workout to be?",
      options: { "20": "20 minutes", "30": "30 minutes", "45": "45 minutes", "60": "1 hour", "90": "90 minutes" }
    },
    workout_days: {
      title: "Which days would you like to work out?", help: "Choose all that apply.",
      options: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" }
    },
    intensity: {
      title: "How hard would you like to train?",
      options: {
        light: "Light: easy and gentle", moderate: "Moderate: I should feel warm and breathe harder",
        vigorous: "Vigorous: hard and challenging", not_sure: "I am not sure"
      }
    },
    extra_goals: {
      title: "What else would you like to achieve?", help: "Choose all that apply.",
      options: {
        run_5k: "Run a 5K", build_muscle: "Build muscle", improve_strength: "Improve strength", more_energy: "Have more energy",
        sleep_better: "Sleep better", improve_mobility: "Move more easily", feel_healthier: "Feel healthier", body_composition: "Improve body composition",
        outdoor_activities: "Enjoy outdoor activities", sustainable_lifestyle: "Build a healthy habit that lasts"
      }
    },
    past_attempts: {
      title: "How have past attempts at getting fitter gone?",
      options: {
        first_time: "This is my first real try", tried_stopped: "I tried before but stopped",
        tried_some_success: "I tried before and had some success", consistent_now: "I am already fairly consistent"
      }
    },
    motivation_level: {
      title: "How motivated do you feel right now?",
      options: { "1": "Not very", "2": "A little", "3": "Moderately", "4": "Quite", "5": "Very motivated" }
    },
    support_style: {
      title: "What kind of support would help you most?", help: "Choose all that apply.",
      options: {
        reminders: "Friendly reminders", community: "Community and challenges", plan_only: "Just my plan, nothing extra",
        coaching_later: "Coaching from professionals, when it becomes available"
      }
    }
  },
  ne: {
    allergies: {
      title: "तपाईंलाई कुनै खानेकुराको एलर्जी वा असहजता छ?",
      help: "हामी यसलाई गम्भीरतापूर्वक लिन्छौं। तपाईंले यहाँ छानेका कुरा भएका खाना हामी सिफारिस गर्ने छैनौं।",
      options: {
        lactose: "ल्याक्टोज (दूधको चिनी)", milk_protein: "दूधको प्रोटिन", nuts: "नट्स", eggs: "अण्डा", fish: "माछा", seafood: "झिंगे माछा र समुद्री खाना",
        gluten: "ग्लुटेन", soy: "सोया", other: "अन्य", none: "यीमध्ये कुनै पनि छैन", prefer_not_to_answer: "उत्तर दिन चाहन्न"
      }
    },
    dietary_requirements: {
      title: "तपाईं कुनै धार्मिक वा व्यक्तिगत खानपानका नियम पालना गर्नुहुन्छ?", help: "ऐच्छिक। चाहनुभयो भने मात्र बताउनुहोस्।",
      options: { no_beef: "गाईको मासु नखाने", no_pork: "सुँगुरको मासु नखाने", no_alcohol: "मदिरा नखाने", fasting_periods: "म निश्चित समयमा व्रत बस्छु", other: "अन्य" }
    },
    food_budget: {
      title: "तपाईंको खानपानको बजेट कस्तो छ?",
      options: { low: "कम, मलाई सस्ता विकल्प चाहिन्छ", medium: "मध्यम", flexible: "लचिलो" }
    },
    eating_out: {
      title: "तपाईं कति पटक बाहिर खानुहुन्छ?",
      options: { never: "लगभग कहिल्यै होइन", weekly_1_2: "हप्तामा १ देखि २ पटक", weekly_3_5: "हप्तामा ३ देखि ५ पटक", daily: "हरेक दिन" }
    },
    health_section_opt_in: {
      title: "के तपाईं स्वास्थ्यसम्बन्धी जानकारी थप्न चाहनुहुन्छ?",
      help: "यो ऐच्छिक हो। हामी हो वा होइन जस्ता सरल प्रश्न मात्र सोध्छौं। हामी औषधिको नाम वा चिकित्सकीय विवरण सोध्दैनौं, र कुनै रोगको निदान वा उपचार गर्दैनौं। तपाईं होइन भन्नुभए पनि फिटसेवा प्रयोग गर्न सक्नुहुन्छ।",
      options: { yes: "हो, थप्छु", no: "होइन, यो भाग छोड्छु" }
    },
    conditions: {
      title: "तपाईंलाई कुनै निदान भइसकेको स्वास्थ्य अवस्था छ?", help: "डाक्टरले भनेका कुरा मात्र छान्नुहोस्। तपाईं यो छोड्न सक्नुहुन्छ।",
      options: {
        high_blood_pressure: "उच्च रक्तचाप", heart_disease: "मुटुको रोग", high_cholesterol: "उच्च कोलेस्ट्रोल", diabetes: "मधुमेह",
        kidney_disease: "मिर्गौलाको रोग", osteoarthritis: "जोर्नी खिइने रोग (अस्टियोआर्थराइटिस)", other: "अर्को स्वास्थ्य अवस्था", none: "यीमध्ये कुनै पनि छैन", prefer_not: "उत्तर दिन चाहन्न"
      }
    },
    takes_medication: {
      title: "के तपाईं अहिले नियमित औषधि खाँदै हुनुहुन्छ?", help: "हो वा होइन मात्र। कृपया औषधिको नाम नलेख्नुहोस्।",
      options: { yes: "हो", no: "होइन", prefer_not: "उत्तर दिन चाहन्न" }
    },
    activity_restricted: {
      title: "के डाक्टरले तपाईंलाई शारीरिक गतिविधि सीमित गर्न भन्नुभएको छ?",
      options: { yes: "हो", no: "होइन", prefer_not: "उत्तर दिन चाहन्न" }
    },
    mobility_limitation: {
      title: "के तपाईंलाई हिँडडुल गर्न कुनै कठिनाइ छ?",
      options: { none: "कुनै कठिनाइ छैन", some: "अलिकति कठिनाइ छ", significant: "धेरै कठिनाइ छ", prefer_not: "उत्तर दिन चाहन्न" }
    },
    needs_assistance: {
      title: "के तपाईंलाई दैनिक शारीरिक कामहरूमा सहयोग चाहिन्छ?",
      options: { yes: "हो", no: "होइन", prefer_not: "उत्तर दिन चाहन्न" }
    },
    energy_level: {
      title: "धेरैजसो दिन तपाईंको ऊर्जा स्तर कस्तो हुन्छ?",
      options: { "1": "धेरै कम", "2": "कम", "3": "मध्यम", "4": "राम्रो", "5": "धेरै राम्रो" }
    },
    pregnancy_breastfeeding: {
      title: "के तपाईं गर्भवती हुनुहुन्छ वा बच्चालाई दूध खुवाउँदै हुनुहुन्छ?", help: "यस समयमा कम खान सुझाव नदिन मात्र हामी यो सोध्छौं।",
      options: { yes: "हो", no: "होइन", prefer_not: "उत्तर दिन चाहन्न" }
    },
    caution_notice: {
      title: "हामीलाई बताउनुभएकोमा धन्यवाद",
      help: "तपाईंले बताएका कुराका आधारमा हामी सामान्य जानकारी मात्र दिनेछौं। आफ्नो खानपान परिवर्तन गर्नु वा नयाँ व्यायाम सुरु गर्नुअघि कृपया योग्य स्वास्थ्य विशेषज्ञसँग कुरा गर्नुहोस्। फिटसेवाले कुनै रोगको निदान वा उपचार गर्दैन।"
    },
    pregnancy_notice: {
      title: "गर्भावस्था वा स्तनपानको समयमा",
      help: "यस समयमा हामी कम खान वा तौल घटाउन सुझाव दिने छैनौं। कृपया आफ्ना डाक्टर वा स्वास्थ्यकर्मीको सल्लाह पालना गर्नुहोस्।"
    },
    experience_level: {
      title: "व्यायाममा तपाईं कत्तिको अनुभवी हुनुहुन्छ?",
      options: { complete_beginner: "बिल्कुल नयाँ", beginner: "सुरुवाती", intermediate: "मध्यम स्तर", advanced: "उन्नत", athlete: "अनुभवी खेलाडी" }
    },
    preferred_exercise: {
      title: "तपाईंलाई कस्तो व्यायाम मन पर्छ?", help: "लागू हुने सबै छान्नुहोस्।",
      options: {
        gym: "जिम व्यायाम", home: "घरमै व्यायाम", walking: "हिँडाइ", running: "दौडिने", cycling: "साइक्लिङ", swimming: "पौडी",
        yoga: "योग", strength: "शक्ति तालिम (वेट)", cardio: "कार्डियो", outdoor: "बाहिरी गतिविधि", hiking_trekking: "हाइकिङ र ट्रेकिङ"
      }
    },
    equipment: {
      title: "तपाईंसँग कुन कुन उपकरण छन्?", help: "लागू हुने सबै छान्नुहोस्।",
      options: {
        none: "कुनै पनि छैन", dumbbells: "डम्बल", resistance_bands: "रेजिस्टेन्स ब्यान्ड", bench_barbell: "बेन्च र बारबेल", full_gym: "पूर्ण जिम सुविधा",
        yoga_mat: "योगा म्याट", bicycle: "साइकल", treadmill: "ट्रेडमिल"
      }
    },
    workout_minutes: {
      title: "तपाईं प्रत्येक वर्कआउट कति लामो चाहनुहुन्छ?",
      options: { "20": "२० मिनेट", "30": "३० मिनेट", "45": "४५ मिनेट", "60": "१ घण्टा", "90": "९० मिनेट" }
    },
    workout_days: {
      title: "तपाईं कुन कुन दिन व्यायाम गर्न चाहनुहुन्छ?", help: "लागू हुने सबै छान्नुहोस्।",
      options: { mon: "सोमबार", tue: "मंगलबार", wed: "बुधबार", thu: "बिहीबार", fri: "शुक्रबार", sat: "शनिबार", sun: "आइतबार" }
    },
    intensity: {
      title: "तपाईं कत्तिको कडा तालिम गर्न चाहनुहुन्छ?",
      options: {
        light: "हल्का: सजिलो र नरम", moderate: "मध्यम: शरीर तातिने र सास छिटो हुने",
        vigorous: "कडा: गाह्रो र चुनौतीपूर्ण", not_sure: "मलाई थाहा छैन"
      }
    },
    extra_goals: {
      title: "तपाईं अरू के हासिल गर्न चाहनुहुन्छ?", help: "लागू हुने सबै छान्नुहोस्।",
      options: {
        run_5k: "५ किमि दौड पूरा गर्ने", build_muscle: "मांसपेशी बनाउने", improve_strength: "शक्ति बढाउने", more_energy: "बढी ऊर्जा पाउने",
        sleep_better: "राम्रोसँग सुत्ने", improve_mobility: "सजिलोसँग चल्ने", feel_healthier: "बढी स्वस्थ महसुस गर्ने", body_composition: "शरीरको बनोट सुधार्ने",
        outdoor_activities: "बाहिरी गतिविधिको आनन्द लिने", sustainable_lifestyle: "दिगो स्वस्थ बानी बनाउने"
      }
    },
    past_attempts: {
      title: "पहिले फिट हुने प्रयासहरू कस्ता रहे?",
      options: {
        first_time: "यो मेरो पहिलो गम्भीर प्रयास हो", tried_stopped: "पहिले प्रयास गरें तर रोकिएँ",
        tried_some_success: "पहिले प्रयास गरें र केही सफल भएँ", consistent_now: "म अहिले पनि निरन्तर गर्दैछु"
      }
    },
    motivation_level: {
      title: "अहिले तपाईं कत्तिको उत्साहित हुनुहुन्छ?",
      options: { "1": "धेरै होइन", "2": "अलिकति", "3": "मध्यम", "4": "धेरैजसो", "5": "धेरै उत्साहित" }
    },
    support_style: {
      title: "कस्तो सहयोगले तपाईंलाई सबैभन्दा मद्दत गर्छ?", help: "लागू हुने सबै छान्नुहोस्।",
      options: {
        reminders: "मिलनसार सम्झना सन्देश", community: "समुदाय र च्यालेन्जहरू", plan_only: "केवल मेरो योजना, अरू केही होइन",
        coaching_later: "विशेषज्ञको प्रशिक्षण, उपलब्ध भएपछि"
      }
    }
  }
};