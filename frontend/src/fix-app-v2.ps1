$appJsxContent = @'
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8000";

const SPEECH_LANG_CODES = {
  hi: "hi-IN", en: "en-IN", mr: "mr-IN", bn: "bn-IN",
  ta: "ta-IN", te: "te-IN", gu: "gu-IN", pa: "pa-IN", or: "or-IN",
};

const LANG_NATIVE_NAMES = {
  hi: "हिंदी", en: "English", mr: "मराठी", bn: "বাংলা",
  ta: "தமிழ்", te: "తెలుగు", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", or: "ଓଡ଼ିଆ",
};

const TRANSLATIONS = {
  hi: {
    tagline: "आपकी आवाज़, आपका रास्ता",
    languageLabel: "भाषा चुनें",
    districtLabel: "जिला चुनें",
    districtNone: "जिला चुनें (वैकल्पिक)",
    navIntake: "आवाज़ इनपुट",
    navIVR: "फोन कॉल डेमो",
    navDashboard: "फील्ड ऑफिसर डैशबोर्ड",
    progressSuffix: "प्रश्न पूरे हुए",
    startRecording: "बोलना शुरू करें",
    recording: "सुन रहा हूँ...",
    unsupportedBrowser: "इस ब्राउज़र में वॉइस रिकग्निशन सपोर्ट नहीं है। कृपया Chrome इस्तेमाल करें।",
    listening: "सुन रहा हूँ... बोलिए",
    processing: "प्रोसेस हो रहा है...",
    errorPrefix: "त्रुटि: ",
    youSaid: "आपने कहा: ",
    recommendationReady: "धन्यवाद! आपकी सिफारिश तैयार की जा रही है...",
    recommendationTitle: "आपकी सिफारिश",
    course: "एनएसक्यूएफ कोर्स",
    trade: "ट्रेड",
    confidenceLabel: "विश्वास स्तर",
    reviewPending: "फील्ड ऑफिसर समीक्षा लंबित - स्वचालित विश्वास स्तर कम था",
    autoApproved: "स्वतः स्वीकृत",
    savedMsg: "रिकॉर्ड डैशबोर्ड में सेव हो गया।",
    dashboardTitle: "लाभार्थी",
    refresh: "रीफ्रेश करें",
    loading: "लोड हो रहा है...",
    noBeneficiaries: "अभी तक कोई लाभार्थी सेव नहीं हुआ।",
    colDate: "तारीख़", colEducation: "शिक्षा", colOccupation: "व्यवसाय",
    colCourse: "कोर्स", colTrade: "ट्रेड", colConfidence: "विश्वास स्तर",
    colStatus: "स्थिति", colDistrict: "जिला",
    needsReview: "समीक्षा आवश्यक", approved: "स्वतः स्वीकृत",
    officerApproved: "अधिकारी द्वारा स्वीकृत", officerReassigned: "पुनः असाइन किया गया",
    approveBtn: "स्वीकृत करें", reassignBtn: "पुनः असाइन करें",
    detailsTitle: "पूरी प्रोफ़ाइल", close: "बंद करें",
    fam: "पारिवारिक व्यवसाय", skills: "रुचियाँ / कौशल",
    mobility: "आवागमन बाधाएँ", empPref: "रोजगार वरीयता",
    localAware: "स्थानीय अवसर जानकारी",
    greeting: "नमस्ते! चलिए शुरू करते हैं। आपने कितनी पढ़ाई की है?",
    incomingCall: "आने वाली कॉल: SAARTHI हेल्पलाइन",
    connectBtn: "कॉल जोड़ें", connected: "कॉल जुड़ गई", hangUp: "कॉल समाप्त करें",
    ivrNote: "यह एक फोन-कॉल आधारित (IVR) अनुभव का डेमो है - फीचर फोन उपयोगकर्ताओं के लिए, बिना इंटरनेट ब्राउज़र के भी यही सिस्टम काम कर सकता है।",
    questions: {
      education: "आपने कितनी पढ़ाई की है?",
      family_occupation: "आपके घर में परिवार का पहले से कौन सा काम होता है?",
      current_livelihood: "अभी आप क्या काम करते हैं?",
      skills_interests: "आपको कौन सा काम करना पसंद है, या आप क्या सीखना चाहते हैं?",
      mobility_constraints: "क्या आपको कहीं आने-जाने में कोई दिक्कत है?",
      employment_preference: "आप खुद का काम शुरू करना चाहेंगे या नौकरी?",
      local_opportunity_awareness: "आपके क्षेत्र में कौन से काम-धंधे उपलब्ध हैं, आपको पता है?",
    },
  },
  en: {
    tagline: "Your voice, your path",
    languageLabel: "Select Language",
    districtLabel: "Select District",
    districtNone: "Select District (optional)",
    navIntake: "Voice Intake",
    navIVR: "Phone Call Demo",
    navDashboard: "Field Officer Dashboard",
    progressSuffix: "questions completed",
    startRecording: "Start Speaking",
    recording: "Listening...",
    unsupportedBrowser: "Voice recognition isn't supported in this browser. Please use Chrome.",
    listening: "Listening... please speak",
    processing: "Processing...",
    errorPrefix: "Error: ",
    youSaid: "You said: ",
    recommendationReady: "Thank you! Preparing your recommendation now...",
    recommendationTitle: "Your Recommendation",
    course: "NSQF Course", trade: "Trade", confidenceLabel: "Confidence",
    reviewPending: "Field officer review pending - automated confidence was low",
    autoApproved: "Auto-Approved",
    savedMsg: "Record saved to dashboard.",
    dashboardTitle: "Beneficiaries", refresh: "Refresh", loading: "Loading...",
    noBeneficiaries: "No beneficiaries saved yet.",
    colDate: "Date", colEducation: "Education", colOccupation: "Occupation",
    colCourse: "Course", colTrade: "Trade", colConfidence: "Confidence",
    colStatus: "Status", colDistrict: "District",
    needsReview: "Needs Review", approved: "Auto-Approved",
    officerApproved: "Approved by Officer", officerReassigned: "Reassigned",
    approveBtn: "Approve", reassignBtn: "Reassign",
    detailsTitle: "Full Profile", close: "Close",
    fam: "Family Occupation", skills: "Skills / Interests",
    mobility: "Mobility Constraints", empPref: "Employment Preference",
    localAware: "Local Opportunity Awareness",
    greeting: "Hello! Let's get started. How much education have you completed?",
    incomingCall: "Incoming Call: SAARTHI Helpline",
    connectBtn: "Connect Call", connected: "Call Connected", hangUp: "Hang Up",
    ivrNote: "This is a demo of a phone-call based (IVR) experience - for feature-phone users, the same underlying system works without any internet browser.",
    questions: {
      education: "How much education have you completed?",
      family_occupation: "What work has your family traditionally done?",
      current_livelihood: "What work do you currently do?",
      skills_interests: "What work do you enjoy, or what would you like to learn?",
      mobility_constraints: "Do you have any difficulty traveling to different places?",
      employment_preference: "Would you prefer to start your own work, or take up a job?",
      local_opportunity_awareness: "Do you know what work opportunities are available in your area?",
    },
  },
  mr: {
    tagline: "तुमचा आवाज, तुमचा मार्ग",
    languageLabel: "भाषा निवडा",
    districtLabel: "जिल्हा निवडा",
    districtNone: "जिल्हा निवडा (पर्यायी)",
    navIntake: "आवाज इनपुट",
    navIVR: "फोन कॉल डेमो",
    navDashboard: "फील्ड ऑफिसर डॅशबोर्ड",
    progressSuffix: "प्रश्न पूर्ण झाले",
    startRecording: "बोलणे सुरू करा",
    recording: "ऐकत आहे...",
    unsupportedBrowser: "या ब्राउझरमध्ये व्हॉइस रेकग्निशन समर्थित नाही. कृपया Chrome वापरा.",
    listening: "ऐकत आहे... बोला",
    processing: "प्रक्रिया सुरू आहे...",
    errorPrefix: "त्रुटी: ",
    youSaid: "तुम्ही म्हणालात: ",
    recommendationReady: "धन्यवाद! तुमची शिफारस तयार केली जात आहे...",
    recommendationTitle: "तुमची शिफारस",
    course: "एनएसक्यूएफ कोर्स", trade: "व्यवसाय", confidenceLabel: "विश्वास पातळी",
    reviewPending: "फील्ड ऑफिसर पुनरावलोकन प्रलंबित - स्वयंचलित विश्वास पातळी कमी होती",
    autoApproved: "स्वयंचलितरित्या मंजूर",
    savedMsg: "रेकॉर्ड डॅशबोर्डमध्ये सेव्ह झाले.",
    dashboardTitle: "लाभार्थी", refresh: "रिफ्रेश करा", loading: "लोड होत आहे...",
    noBeneficiaries: "अजून कोणताही लाभार्थी सेव्ह झाला नाही.",
    colDate: "तारीख", colEducation: "शिक्षण", colOccupation: "व्यवसाय",
    colCourse: "कोर्स", colTrade: "व्यवसाय", colConfidence: "विश्वास पातळी",
    colStatus: "स्थिती", colDistrict: "जिल्हा",
    needsReview: "पुनरावलोकन आवश्यक", approved: "स्वयंचलितरित्या मंजूर",
    officerApproved: "अधिकाऱ्याने मंजूर केले", officerReassigned: "पुन्हा नियुक्त केले",
    approveBtn: "मंजूर करा", reassignBtn: "पुन्हा नियुक्त करा",
    detailsTitle: "संपूर्ण प्रोफाइल", close: "बंद करा",
    fam: "कौटुंबिक व्यवसाय", skills: "कौशल्ये / आवडी",
    mobility: "प्रवास मर्यादा", empPref: "रोजगार प्राधान्य",
    localAware: "स्थानिक संधीची माहिती",
    greeting: "नमस्कार! चला सुरुवात करूया. तुम्ही किती शिक्षण घेतले आहे?",
    incomingCall: "येणारा कॉल: SAARTHI हेल्पलाइन",
    connectBtn: "कॉल जोडा", connected: "कॉल जोडला गेला", hangUp: "कॉल संपवा",
    ivrNote: "हे फोन-कॉल आधारित (IVR) अनुभवाचे डेमो आहे - फीचर फोन वापरकर्त्यांसाठी, इंटरनेट ब्राउझरशिवायही हीच प्रणाली काम करू शकते.",
    questions: {
      education: "तुम्ही किती शिक्षण घेतले आहे?",
      family_occupation: "तुमच्या घरात कुटुंबाचा पारंपरिक व्यवसाय कोणता आहे?",
      current_livelihood: "सध्या तुम्ही काय काम करता?",
      skills_interests: "तुम्हाला कोणते काम करायला आवडते, किंवा तुम्ही काय शिकू इच्छिता?",
      mobility_constraints: "तुम्हाला कुठेही ये-जा करण्यात काही अडचण आहे का?",
      employment_preference: "तुम्हाला स्वतःचा व्यवसाय सुरू करायचा आहे की नोकरी करायची आहे?",
      local_opportunity_awareness: "तुमच्या भागात कोणते काम-धंदे उपलब्ध आहेत, याची तुम्हाला माहिती आहे का?",
    },
  },
  bn: {
    tagline: "আপনার কণ্ঠ, আপনার পথ",
    languageLabel: "ভাষা নির্বাচন করুন",
    districtLabel: "জেলা নির্বাচন করুন",
    districtNone: "জেলা নির্বাচন করুন (ঐচ্ছিক)",
    navIntake: "ভয়েস ইনটেক",
    navIVR: "ফোন কল ডেমো",
    navDashboard: "ফিল্ড অফিসার ড্যাশবোর্ড",
    progressSuffix: "প্রশ্ন সম্পন্ন হয়েছে",
    startRecording: "কথা বলা শুরু করুন",
    recording: "শুনছি...",
    unsupportedBrowser: "এই ব্রাউজারে ভয়েস রিকগনিশন সমর্থিত নয়। অনুগ্রহ করে Chrome ব্যবহার করুন।",
    listening: "শুনছি... বলুন",
    processing: "প্রক্রিয়াকরণ চলছে...",
    errorPrefix: "ত্রুটি: ",
    youSaid: "আপনি বলেছেন: ",
    recommendationReady: "ধন্যবাদ! আপনার সুপারিশ তৈরি করা হচ্ছে...",
    recommendationTitle: "আপনার সুপারিশ",
    course: "এনএসকিউএফ কোর্স", trade: "ট্রেড", confidenceLabel: "আত্মবিশ্বাসের মাত্রা",
    reviewPending: "ফিল্ড অফিসার পর্যালোচনা মুলতুবি - স্বয়ংক্রিয় আত্মবিশ্বাসের মাত্রা কম ছিল",
    autoApproved: "স্বয়ংক্রিয়ভাবে অনুমোদিত",
    savedMsg: "রেকর্ড ড্যাশবোর্ডে সংরক্ষিত হয়েছে।",
    dashboardTitle: "সুবিধাভোগী", refresh: "রিফ্রেশ করুন", loading: "লোড হচ্ছে...",
    noBeneficiaries: "এখনও কোনো সুবিধাভোগী সংরক্ষিত হয়নি।",
    colDate: "তারিখ", colEducation: "শিক্ষা", colOccupation: "পেশা",
    colCourse: "কোর্স", colTrade: "ট্রেড", colConfidence: "আত্মবিশ্বাসের মাত্রা",
    colStatus: "অবস্থা", colDistrict: "জেলা",
    needsReview: "পর্যালোচনা প্রয়োজন", approved: "স্বয়ংক্রিয়ভাবে অনুমোদিত",
    officerApproved: "অফিসার দ্বারা অনুমোদিত", officerReassigned: "পুনরায় বরাদ্দ করা হয়েছে",
    approveBtn: "অনুমোদন করুন", reassignBtn: "পুনরায় বরাদ্দ করুন",
    detailsTitle: "সম্পূর্ণ প্রোফাইল", close: "বন্ধ করুন",
    fam: "পারিবারিক পেশা", skills: "দক্ষতা / আগ্রহ",
    mobility: "চলাচলের সীমাবদ্ধতা", empPref: "কর্মসংস্থান পছন্দ",
    localAware: "স্থানীয় সুযোগের সচেতনতা",
    greeting: "নমস্কার! চলুন শুরু করি। আপনি কতটা শিক্ষা সম্পন্ন করেছেন?",
    incomingCall: "আগত কল: SAARTHI হেল্পলাইন",
    connectBtn: "কল সংযুক্ত করুন", connected: "কল সংযুক্ত হয়েছে", hangUp: "কল শেষ করুন",
    ivrNote: "এটি একটি ফোন-কল ভিত্তিক (IVR) অভিজ্ঞতার ডেমো - ফিচার ফোন ব্যবহারকারীদের জন্য, ইন্টারনেট ব্রাউজার ছাড়াই একই সিস্টেম কাজ করতে পারে।",
    questions: {
      education: "আপনি কতটা শিক্ষা সম্পন্ন করেছেন?",
      family_occupation: "আপনার পরিবারে ঐতিহ্যগতভাবে কী কাজ করা হয়?",
      current_livelihood: "বর্তমানে আপনি কী কাজ করেন?",
      skills_interests: "আপনি কোন কাজ করতে পছন্দ করেন, বা আপনি কী শিখতে চান?",
      mobility_constraints: "আপনার কোথাও যাতায়াতে কোনো অসুবিধা আছে কি?",
      employment_preference: "আপনি কি নিজের ব্যবসা শুরু করতে চান নাকি চাকরি করতে চান?",
      local_opportunity_awareness: "আপনার এলাকায় কী কাজ-ব্যবসা পাওয়া যায়, তা কি আপনার জানা আছে?",
    },
  },
  ta: {
    tagline: "உங்கள் குரல், உங்கள் பாதை",
    languageLabel: "மொழியைத் தேர்ந்தெடுக்கவும்",
    districtLabel: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்",
    districtNone: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும் (விருப்பம்)",
    navIntake: "குரல் உள்ளீடு",
    navIVR: "தொலைபேசி அழைப்பு டெமோ",
    navDashboard: "கள அதிகாரி டாஷ்போர்டு",
    progressSuffix: "கேள்விகள் முடிந்தன",
    startRecording: "பேசத் தொடங்கவும்",
    recording: "கேட்கிறேன்...",
    unsupportedBrowser: "இந்த உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை. தயவுசெய்து Chrome பயன்படுத்தவும்.",
    listening: "கேட்கிறேன்... பேசுங்கள்",
    processing: "செயலாக்கம் நடைபெறுகிறது...",
    errorPrefix: "பிழை: ",
    youSaid: "நீங்கள் சொன்னது: ",
    recommendationReady: "நன்றி! உங்கள் பரிந்துரை தயாரிக்கப்படுகிறது...",
    recommendationTitle: "உங்கள் பரிந்துரை",
    course: "என்எஸ்க்யூஎஃப் பாடநெறி", trade: "தொழில்", confidenceLabel: "நம்பிக்கை நிலை",
    reviewPending: "கள அதிகாரி மதிப்பாய்வு நிலுவையில் உள்ளது - தானியங்கி நம்பிக்கை நிலை குறைவாக இருந்தது",
    autoApproved: "தானாக அங்கீகரிக்கப்பட்டது",
    savedMsg: "பதிவு டாஷ்போர்டில் சேமிக்கப்பட்டது.",
    dashboardTitle: "பயனாளிகள்", refresh: "புதுப்பிக்கவும்", loading: "ஏற்றப்படுகிறது...",
    noBeneficiaries: "இதுவரை எந்த பயனாளியும் சேமிக்கப்படவில்லை.",
    colDate: "தேதி", colEducation: "கல்வி", colOccupation: "தொழில்",
    colCourse: "பாடநெறி", colTrade: "தொழில்", colConfidence: "நம்பிக்கை நிலை",
    colStatus: "நிலை", colDistrict: "மாவட்டம்",
    needsReview: "மதிப்பாய்வு தேவை", approved: "தானாக அங்கீகரிக்கப்பட்டது",
    officerApproved: "அதிகாரியால் அங்கீகரிக்கப்பட்டது", officerReassigned: "மீண்டும் ஒதுக்கப்பட்டது",
    approveBtn: "அங்கீகரிக்கவும்", reassignBtn: "மீண்டும் ஒதுக்கவும்",
    detailsTitle: "முழு சுயவிவரம்", close: "மூடு",
    fam: "குடும்பத் தொழில்", skills: "திறன்கள் / ஆர்வங்கள்",
    mobility: "நடமாட்டக் கட்டுப்பாடுகள்", empPref: "வேலைவாய்ப்பு விருப்பம்",
    localAware: "உள்ளூர் வாய்ப்பு விழிப்புணர்வு",
    greeting: "வணக்கம்! தொடங்குவோம். நீங்கள் எவ்வளவு படித்திருக்கிறீர்கள்?",
    incomingCall: "வரும் அழைப்பு: SAARTHI உதவி மையம்",
    connectBtn: "அழைப்பை இணைக்கவும்", connected: "அழைப்பு இணைக்கப்பட்டது", hangUp: "அழைப்பை முடிக்கவும்",
    ivrNote: "இது ஒரு தொலைபேசி அழைப்பு அடிப்படையிலான (IVR) அனுபவத்தின் டெமோ ஆகும் - ஃபீச்சர் போன் பயனர்களுக்கு, இணைய உலாவி இல்லாமலும் இதே அமைப்பு வேலை செய்யும்.",
    questions: {
      education: "நீங்கள் எவ்வளவு படித்திருக்கிறீர்கள்?",
      family_occupation: "உங்கள் குடும்பத்தில் பாரம்பரியமாக என்ன வேலை செய்யப்படுகிறது?",
      current_livelihood: "தற்போது நீங்கள் என்ன வேலை செய்கிறீர்கள்?",
      skills_interests: "நீங்கள் எந்த வேலையை விரும்புகிறீர்கள், அல்லது என்ன கற்க விரும்புகிறீர்கள்?",
      mobility_constraints: "எங்காவது செல்வதில் உங்களுக்கு ஏதேனும் சிரமம் உள்ளதா?",
      employment_preference: "நீங்கள் சொந்த தொழிலைத் தொடங்க விரும்புகிறீர்களா அல்லது வேலை செய்ய விரும்புகிறீர்களா?",
      local_opportunity_awareness: "உங்கள் பகுதியில் என்ன வேலை-தொழில்கள் கிடைக்கின்றன என்பது உங்களுக்குத் தெரியுமா?",
    },
  },
  te: {
    tagline: "మీ గొంతు, మీ మార్గం",
    languageLabel: "భాషను ఎంచుకోండి",
    districtLabel: "జిల్లాను ఎంచుకోండి",
    districtNone: "జిల్లాను ఎంచుకోండి (ఐచ్ఛికం)",
    navIntake: "వాయిస్ ఇన్‌టేక్",
    navIVR: "ఫోన్ కాల్ డెమో",
    navDashboard: "ఫీల్డ్ ఆఫీసర్ డాష్‌బోర్డ్",
    progressSuffix: "ప్రశ్నలు పూర్తయ్యాయి",
    startRecording: "మాట్లాడటం ప్రారంభించండి",
    recording: "వింటున్నాను...",
    unsupportedBrowser: "ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ మద్దతు లేదు. దయచేసి Chrome ఉపయోగించండి.",
    listening: "వింటున్నాను... మాట్లాడండి",
    processing: "ప్రాసెస్ అవుతోంది...",
    errorPrefix: "లోపం: ",
    youSaid: "మీరు చెప్పారు: ",
    recommendationReady: "ధన్యవాదాలు! మీ సిఫార్సు సిద్ధం చేయబడుతోంది...",
    recommendationTitle: "మీ సిఫార్సు",
    course: "ఎన్ఎస్క్యూఎఫ్ కోర్సు", trade: "వృత్తి", confidenceLabel: "నమ్మక స్థాయి",
    reviewPending: "ఫీల్డ్ ఆఫీసర్ సమీక్ష పెండింగ్‌లో ఉంది - ఆటోమేటెడ్ నమ్మక స్థాయి తక్కువగా ఉంది",
    autoApproved: "స్వయంచాలకంగా ఆమోదించబడింది",
    savedMsg: "రికార్డు డాష్‌బోర్డ్‌లో సేవ్ చేయబడింది.",
    dashboardTitle: "లబ్ధిదారులు", refresh: "రిఫ్రెష్ చేయండి", loading: "లోడ్ అవుతోంది...",
    noBeneficiaries: "ఇంకా ఏ లబ్ధిదారుడు సేవ్ చేయబడలేదు.",
    colDate: "తేదీ", colEducation: "విద్య", colOccupation: "వృత్తి",
    colCourse: "కోర్సు", colTrade: "వృత్తి", colConfidence: "నమ్మక స్థాయి",
    colStatus: "స్థితి", colDistrict: "జిల్లా",
    needsReview: "సమీక్ష అవసరం", approved: "స్వయంచాలకంగా ఆమోదించబడింది",
    officerApproved: "అధికారి ఆమోదించారు", officerReassigned: "మళ్ళీ కేటాయించబడింది",
    approveBtn: "ఆమోదించండి", reassignBtn: "మళ్ళీ కేటాయించండి",
    detailsTitle: "పూర్తి ప్రొఫైల్", close: "మూసివేయండి",
    fam: "కుటుంబ వృత్తి", skills: "నైపుణ్యాలు / ఆసక్తులు",
    mobility: "ప్రయాణ పరిమితులు", empPref: "ఉపాధి ప్రాధాన్యత",
    localAware: "స్థానిక అవకాశాల అవగాహన",
    greeting: "నమస్కారం! ప్రారంభిద్దాం. మీరు ఎంత చదువుకున్నారు?",
    incomingCall: "వస్తున్న కాల్: SAARTHI హెల్ప్‌లైన్",
    connectBtn: "కాల్‌ను కనెక్ట్ చేయండి", connected: "కాల్ కనెక్ట్ అయింది", hangUp: "కాల్‌ను ముగించండి",
    ivrNote: "ఇది ఫోన్-కాల్ ఆధారిత (IVR) అనుభవం యొక్క డెమో - ఫీచర్ ఫోన్ వినియోగదారుల కోసం, ఇంటర్నెట్ బ్రౌజర్ లేకుండా కూడా ఇదే వ్యవస్థ పనిచేస్తుంది.",
    questions: {
      education: "మీరు ఎంత చదువుకున్నారు?",
      family_occupation: "మీ కుటుంబంలో సాంప్రదాయకంగా ఏ పని చేస్తారు?",
      current_livelihood: "ప్రస్తుతం మీరు ఏమి పని చేస్తున్నారు?",
      skills_interests: "మీరు ఏ పని చేయడం ఇష్టపడతారు, లేదా మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?",
      mobility_constraints: "మీకు ఎక్కడికైనా వెళ్లడంలో ఏదైనా ఇబ్బంది ఉందా?",
      employment_preference: "మీరు సొంత వ్యాపారం ప్రారంభించాలనుకుంటున్నారా లేదా ఉద్యోగం చేయాలనుకుంటున్నారా?",
      local_opportunity_awareness: "మీ ప్రాంతంలో ఏ పనులు-వ్యాపారాలు అందుబాటులో ఉన్నాయో మీకు తెలుసా?",
    },
  },
  gu: {
    tagline: "તમારો અવાજ, તમારો માર્ગ",
    languageLabel: "ભાષા પસંદ કરો",
    districtLabel: "જિલ્લો પસંદ કરો",
    districtNone: "જિલ્લો પસંદ કરો (વૈકલ્પિક)",
    navIntake: "વોઇસ ઇનટેક",
    navIVR: "ફોન કોલ ડેમો",
    navDashboard: "ફિલ્ડ ઓફિસર ડેશબોર્ડ",
    progressSuffix: "પ્રશ્નો પૂર્ણ થયા",
    startRecording: "બોલવાનું શરૂ કરો",
    recording: "સાંભળી રહ્યો છું...",
    unsupportedBrowser: "આ બ્રાઉઝરમાં વૉઇસ રેકગ્નિશન સપોર્ટેડ નથી. કૃપા કરી Chrome વાપરો.",
    listening: "સાંભળી રહ્યો છું... બોલો",
    processing: "પ્રક્રિયા ચાલી રહી છે...",
    errorPrefix: "ભૂલ: ",
    youSaid: "તમે કહ્યું: ",
    recommendationReady: "આભાર! તમારી ભલામણ તૈયાર કરવામાં આવી રહી છે...",
    recommendationTitle: "તમારી ભલામણ",
    course: "એનએસક્યુએફ કોર્સ", trade: "વ્યવસાય", confidenceLabel: "વિશ્વાસ સ્તર",
    reviewPending: "ફિલ્ડ ઓફિસર સમીક્ષા બાકી - સ્વયંસંચાલિત વિશ્વાસ સ્તર ઓછું હતું",
    autoApproved: "સ્વયંસંચાલિત રીતે મંજૂર",
    savedMsg: "રેકોર્ડ ડેશબોર્ડમાં સેવ થયો.",
    dashboardTitle: "લાભાર્થીઓ", refresh: "રિફ્રેશ કરો", loading: "લોડ થઈ રહ્યું છે...",
    noBeneficiaries: "હજુ સુધી કોઈ લાભાર્થી સેવ થયો નથી.",
    colDate: "તારીખ", colEducation: "શિક્ષણ", colOccupation: "વ્યવસાય",
    colCourse: "કોર્સ", colTrade: "વ્યવસાય", colConfidence: "વિશ્વાસ સ્તર",
    colStatus: "સ્થિતિ", colDistrict: "જિલ્લો",
    needsReview: "સમીક્ષા જરૂરી", approved: "સ્વયંસંચાલિત રીતે મંજૂર",
    officerApproved: "અધિકારી દ્વારા મંજૂર", officerReassigned: "ફરીથી સોંપાયેલ",
    approveBtn: "મંજૂર કરો", reassignBtn: "ફરીથી સોંપો",
    detailsTitle: "સંપૂર્ણ પ્રોફાઇલ", close: "બંધ કરો",
    fam: "કૌટુંબિક વ્યવસાય", skills: "કૌશલ્યો / રુચિઓ",
    mobility: "અવરજવર મર્યાદાઓ", empPref: "રોજગાર પસંદગી",
    localAware: "સ્થાનિક તક જાગૃતિ",
    greeting: "નમસ્તે! ચાલો શરૂ કરીએ. તમે કેટલું ભણ્યા છો?",
    incomingCall: "આવતો કોલ: SAARTHI હેલ્પલાઇન",
    connectBtn: "કોલ જોડો", connected: "કોલ જોડાયો", hangUp: "કોલ સમાપ્ત કરો",
    ivrNote: "આ ફોન-કોલ આધારિત (IVR) અનુભવનું ડેમો છે - ફીચર ફોન વપરાશકર્તાઓ માટે, ઇન્ટરનેટ બ્રાઉઝર વિના પણ આ જ સિસ્ટમ કામ કરી શકે છે.",
    questions: {
      education: "તમે કેટલું ભણ્યા છો?",
      family_occupation: "તમારા ઘરમાં પરિવારનો પરંપરાગત વ્યવસાય શું છે?",
      current_livelihood: "હાલમાં તમે શું કામ કરો છો?",
      skills_interests: "તમને કયું કામ કરવું ગમે છે, અથવા તમે શું શીખવા માંગો છો?",
      mobility_constraints: "શું તમને ક્યાંય આવવા-જવામાં કોઈ મુશ્કેલી છે?",
      employment_preference: "શું તમે તમારો પોતાનો વ્યવસાય શરૂ કરવા માંગો છો કે નોકરી કરવા માંગો છો?",
      local_opportunity_awareness: "તમારા વિસ્તારમાં કયા કામ-ધંધા ઉપલબ્ધ છે, તે તમને ખબર છે?",
    },
  },
  pa: {
    tagline: "ਤੁਹਾਡੀ ਆਵਾਜ਼, ਤੁਹਾਡਾ ਰਾਹ",
    languageLabel: "ਭਾਸ਼ਾ ਚੁਣੋ",
    districtLabel: "ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ",
    districtNone: "ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ (ਵਿਕਲਪਿਕ)",
    navIntake: "ਆਵਾਜ਼ ਇਨਪੁੱਟ",
    navIVR: "ਫੋਨ ਕਾਲ ਡੈਮੋ",
    navDashboard: "ਫੀਲਡ ਅਫਸਰ ਡੈਸ਼ਬੋਰਡ",
    progressSuffix: "ਸਵਾਲ ਪੂਰੇ ਹੋਏ",
    startRecording: "ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ",
    recording: "ਸੁਣ ਰਿਹਾ ਹਾਂ...",
    unsupportedBrowser: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਵੌਇਸ ਰਿਕੋਗਨੀਸ਼ਨ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ Chrome ਵਰਤੋ।",
    listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ... ਬੋਲੋ",
    processing: "ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ ਹੈ...",
    errorPrefix: "ਗਲਤੀ: ",
    youSaid: "ਤੁਸੀਂ ਕਿਹਾ: ",
    recommendationReady: "ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਸਿਫਾਰਸ਼ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    recommendationTitle: "ਤੁਹਾਡੀ ਸਿਫਾਰਸ਼",
    course: "ਐਨਐਸਕਿਊਐਫ ਕੋਰਸ", trade: "ਕਿੱਤਾ", confidenceLabel: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
    reviewPending: "ਫੀਲਡ ਅਫਸਰ ਸਮੀਖਿਆ ਬਾਕੀ - ਆਟੋਮੇਟਿਡ ਭਰੋਸੇ ਦਾ ਪੱਧਰ ਘੱਟ ਸੀ",
    autoApproved: "ਆਟੋਮੈਟਿਕ ਮਨਜ਼ੂਰ",
    savedMsg: "ਰਿਕਾਰਡ ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਸੇਵ ਹੋ ਗਿਆ।",
    dashboardTitle: "ਲਾਭਪਾਤਰੀ", refresh: "ਤਾਜ਼ਾ ਕਰੋ", loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    noBeneficiaries: "ਹਾਲੇ ਤੱਕ ਕੋਈ ਲਾਭਪਾਤਰੀ ਸੇਵ ਨਹੀਂ ਹੋਇਆ।",
    colDate: "ਮਿਤੀ", colEducation: "ਸਿੱਖਿਆ", colOccupation: "ਕਿੱਤਾ",
    colCourse: "ਕੋਰਸ", colTrade: "ਕਿੱਤਾ", colConfidence: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
    colStatus: "ਸਥਿਤੀ", colDistrict: "ਜ਼ਿਲ੍ਹਾ",
    needsReview: "ਸਮੀਖਿਆ ਲੋੜੀਂਦੀ", approved: "ਆਟੋਮੈਟਿਕ ਮਨਜ਼ੂਰ",
    officerApproved: "ਅਫਸਰ ਦੁਆਰਾ ਮਨਜ਼ੂਰ", officerReassigned: "ਮੁੜ ਸੌਂਪਿਆ ਗਿਆ",
    approveBtn: "ਮਨਜ਼ੂਰ ਕਰੋ", reassignBtn: "ਮੁੜ ਸੌਂਪੋ",
    detailsTitle: "ਪੂਰੀ ਪ੍ਰੋਫਾਈਲ", close: "ਬੰਦ ਕਰੋ",
    fam: "ਪਰਿਵਾਰਕ ਕਿੱਤਾ", skills: "ਹੁਨਰ / ਰੁਚੀਆਂ",
    mobility: "ਆਵਾਜਾਈ ਦੀਆਂ ਰੁਕਾਵਟਾਂ", empPref: "ਰੁਜ਼ਗਾਰ ਤਰਜੀਹ",
    localAware: "ਸਥਾਨਕ ਮੌਕੇ ਦੀ ਜਾਗਰੂਕਤਾ",
    greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਆਓ ਸ਼ੁਰੂ ਕਰੀਏ। ਤੁਸੀਂ ਕਿੰਨੀ ਪੜ੍ਹਾਈ ਕੀਤੀ ਹੈ?",
    incomingCall: "ਆ ਰਹੀ ਕਾਲ: SAARTHI ਹੈਲਪਲਾਈਨ",
    connectBtn: "ਕਾਲ ਜੋੜੋ", connected: "ਕਾਲ ਜੁੜ ਗਈ", hangUp: "ਕਾਲ ਖਤਮ ਕਰੋ",
    ivrNote: "ਇਹ ਇੱਕ ਫੋਨ-ਕਾਲ ਅਧਾਰਿਤ (IVR) ਅਨੁਭਵ ਦਾ ਡੈਮੋ ਹੈ - ਫੀਚਰ ਫੋਨ ਵਰਤਣ ਵਾਲਿਆਂ ਲਈ, ਇੰਟਰਨੈੱਟ ਬ੍ਰਾਊਜ਼ਰ ਤੋਂ ਬਿਨਾਂ ਵੀ ਇਹੀ ਸਿਸਟਮ ਕੰਮ ਕਰ ਸਕਦਾ ਹੈ।",
    questions: {
      education: "ਤੁਸੀਂ ਕਿੰਨੀ ਪੜ੍ਹਾਈ ਕੀਤੀ ਹੈ?",
      family_occupation: "ਤੁਹਾਡੇ ਘਰ ਵਿੱਚ ਪਰਿਵਾਰ ਦਾ ਰਵਾਇਤੀ ਕਿੱਤਾ ਕੀ ਹੈ?",
      current_livelihood: "ਇਸ ਵੇਲੇ ਤੁਸੀਂ ਕੀ ਕੰਮ ਕਰਦੇ ਹੋ?",
      skills_interests: "ਤੁਹਾਨੂੰ ਕਿਹੜਾ ਕੰਮ ਕਰਨਾ ਪਸੰਦ ਹੈ, ਜਾਂ ਤੁਸੀਂ ਕੀ ਸਿੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
      mobility_constraints: "ਕੀ ਤੁਹਾਨੂੰ ਕਿਤੇ ਆਉਣ-ਜਾਣ ਵਿੱਚ ਕੋਈ ਦਿੱਕਤ ਹੈ?",
      employment_preference: "ਕੀ ਤੁਸੀਂ ਆਪਣਾ ਕੰਮ ਸ਼ੁਰੂ ਕਰਨਾ ਚਾਹੋਗੇ ਜਾਂ ਨੌਕਰੀ ਕਰਨਾ?",
      local_opportunity_awareness: "ਤੁਹਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਕਿਹੜੇ ਕੰਮ-ਧੰਦੇ ਉਪਲਬਧ ਹਨ, ਕੀ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ?",
    },
  },
  or: {
    tagline: "ଆପଣଙ୍କ ସ୍ୱର, ଆପଣଙ୍କ ପଥ",
    languageLabel: "ଭାଷା ବାଛନ୍ତୁ",
    districtLabel: "ଜିଲ୍ଲା ବାଛନ୍ତୁ",
    districtNone: "ଜିଲ୍ଲା ବାଛନ୍ତୁ (ଇଚ୍ଛାଧୀନ)",
    navIntake: "ଭଏସ୍ ଇନଟେକ୍",
    navIVR: "ଫୋନ୍ କଲ୍ ଡେମୋ",
    navDashboard: "ଫିଲ୍ଡ ଅଫିସର ଡ୍ୟାସବୋର୍ଡ",
    progressSuffix: "ପ୍ରଶ୍ନ ସମ୍ପୂର୍ଣ୍ଣ ହେଲା",
    startRecording: "କହିବା ଆରମ୍ଭ କରନ୍ତୁ",
    recording: "ଶୁଣୁଛି...",
    unsupportedBrowser: "ଏହି ବ୍ରାଉଜରରେ ଭଏସ୍ ରିକଗନିସନ୍ ସମର୍ଥିତ ନୁହେଁ। ଦୟାକରି Chrome ବ୍ୟବହାର କରନ୍ତୁ।",
    listening: "ଶୁଣୁଛି... କୁହନ୍ତୁ",
    processing: "ପ୍ରକ୍ରିୟାକରଣ ଚାଲିଛି...",
    errorPrefix: "ତ୍ରୁଟି: ",
    youSaid: "ଆପଣ କହିଲେ: ",
    recommendationReady: "ଧନ୍ୟବାଦ! ଆପଣଙ୍କ ସୁପାରିଶ ପ୍ରସ୍ତୁତ କରାଯାଉଛି...",
    recommendationTitle: "ଆପଣଙ୍କ ସୁପାରିଶ",
    course: "ଏନଏସକ୍ୟୁଏଫ୍ କୋର୍ସ", trade: "ବୃତ୍ତି", confidenceLabel: "ବିଶ୍ୱାସ ସ୍ତର",
    reviewPending: "ଫିଲ୍ଡ ଅଫିସର ସମୀକ୍ଷା ବିଚାରାଧୀନ - ସ୍ୱୟଂଚାଳିତ ବିଶ୍ୱାସ ସ୍ତର କମ୍ ଥିଲା",
    autoApproved: "ସ୍ୱୟଂଚାଳିତ ଭାବେ ଅନୁମୋଦିତ",
    savedMsg: "ରେକର୍ଡ ଡ୍ୟାସବୋର୍ଡରେ ସେଭ ହେଲା।",
    dashboardTitle: "ହିତାଧିକାରୀ", refresh: "ରିଫ୍ରେସ୍ କରନ୍ତୁ", loading: "ଲୋଡ୍ ହେଉଛି...",
    noBeneficiaries: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ହିତାଧିକାରୀ ସେଭ ହୋଇନାହିଁ।",
    colDate: "ତାରିଖ", colEducation: "ଶିକ୍ଷା", colOccupation: "ବୃତ୍ତି",
    colCourse: "କୋର୍ସ", colTrade: "ବୃତ୍ତି", colConfidence: "ବିଶ୍ୱାସ ସ୍ତର",
    colStatus: "ସ୍ଥିତି", colDistrict: "ଜିଲ୍ଲା",
    needsReview: "ସମୀକ୍ଷା ଆବଶ୍ୟକ", approved: "ସ୍ୱୟଂଚାଳିତ ଭାବେ ଅନୁମୋଦିତ",
    officerApproved: "ଅଫିସର ଦ୍ୱାରା ଅନୁମୋଦିତ", officerReassigned: "ପୁନଃ ନିଯୁକ୍ତ",
    approveBtn: "ଅନୁମୋଦନ କରନ୍ତୁ", reassignBtn: "ପୁନଃ ନିଯୁକ୍ତ କରନ୍ତୁ",
    detailsTitle: "ସମ୍ପୂର୍ଣ୍ଣ ପ୍ରୋଫାଇଲ୍", close: "ବନ୍ଦ କରନ୍ତୁ",
    fam: "ପାରିବାରିକ ବୃତ୍ତି", skills: "ଦକ୍ଷତା / ଆଗ୍ରହ",
    mobility: "ଗତିଶୀଳତା ସୀମା", empPref: "ନିଯୁକ୍ତି ପସନ୍ଦ",
    localAware: "ସ୍ଥାନୀୟ ସୁଯୋଗ ସଚେତନତା",
    greeting: "ନମସ୍କାର! ଆସନ୍ତୁ ଆରମ୍ଭ କରିବା। ଆପଣ କେତେ ପାଠ ପଢ଼ିଛନ୍ତି?",
    incomingCall: "ଆସୁଥିବା କଲ୍: SAARTHI ହେଲ୍ପଲାଇନ୍",
    connectBtn: "କଲ୍ ସଂଯୋଗ କରନ୍ତୁ", connected: "କଲ୍ ସଂଯୁକ୍ତ ହେଲା", hangUp: "କଲ୍ ଶେଷ କରନ୍ତୁ",
    ivrNote: "ଏହା ଏକ ଫୋନ୍-କଲ୍ ଆଧାରିତ (IVR) ଅନୁଭୂତିର ଡେମୋ - ଫିଚର ଫୋନ୍ ବ୍ୟବହାରକାରୀଙ୍କ ପାଇଁ, ଇଣ୍ଟରନେଟ୍ ବ୍ରାଉଜର୍ ବିନା ମଧ୍ୟ ଏହି ସିଷ୍ଟମ୍ କାମ କରିପାରେ।",
    questions: {
      education: "ଆପଣ କେତେ ପାଠ ପଢ଼ିଛନ୍ତି?",
      family_occupation: "ଆପଣଙ୍କ ଘରେ ପାରମ୍ପାରିକ ଭାବେ କେଉଁ କାମ କରାଯାଏ?",
      current_livelihood: "ବର୍ତ୍ତମାନ ଆପଣ କଣ କାମ କରନ୍ତି?",
      skills_interests: "ଆପଣଙ୍କୁ କେଉଁ କାମ କରିବାକୁ ଭଲ ଲାଗେ, କିମ୍ବା ଆପଣ କଣ ଶିଖିବାକୁ ଚାହାନ୍ତି?",
      mobility_constraints: "ଆପଣଙ୍କୁ କୌଣସି ସ୍ଥାନକୁ ଯିବା-ଆସିବାରେ କୌଣସି ଅସୁବିଧା ଅଛି କି?",
      employment_preference: "ଆପଣ ନିଜର ବ୍ୟବସାୟ ଆରମ୍ଭ କରିବାକୁ ଚାହାନ୍ତି ନା ଚାକିରି କରିବାକୁ?",
      local_opportunity_awareness: "ଆପଣଙ୍କ ଅଞ୍ଚଳରେ କେଉଁ କାମ-ବ୍ୟବସାୟ ଉପଲବ୍ଧ ଅଛି, ତାହା ଆପଣ ଜାଣନ୍ତି କି?",
    },
  },
};

function App() {
  const [view, setView] = useState("intake");
  const [districts, setDistricts] = useState([]);
  const [callConnected, setCallConnected] = useState(false);

  const [profile, setProfile] = useState({
    education: "", family_occupation: "", current_livelihood: "",
    skills_interests: "", mobility_constraints: "", employment_preference: "",
    local_opportunity_awareness: "", district: "", language: "hi",
  });

  const t = TRANSLATIONS[profile.language] || TRANSLATIONS.hi;

  const [currentQuestion, setCurrentQuestion] = useState(TRANSLATIONS.hi.greeting);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [saved, setSaved] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const recognitionRef = useRef(null);

  const fieldOrder = [
    "education", "family_occupation", "current_livelihood",
    "skills_interests", "mobility_constraints", "employment_preference",
    "local_opportunity_awareness",
  ];

  const getNextEmptyField = (p) => fieldOrder.find((f) => !p[f]);

  useEffect(() => {
    axios.get(API_BASE + "/districts").then((res) => setDistricts(res.data)).catch(() => {});
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setProfile((prev) => ({ ...prev, language: newLang }));
    const started = fieldOrder.some((f) => profile[f]);
    if (!started && !intakeComplete) {
      setCurrentQuestion(TRANSLATIONS[newLang].greeting);
    }
  };

  const handleDistrictChange = (e) => {
    setProfile((prev) => ({ ...prev, district: e.target.value }));
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMsg(t.unsupportedBrowser);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_CODES[profile.language] || "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setStatusMsg(t.listening);
    };
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleTranscript(text);
    };
    recognition.onerror = (event) => {
      setStatusMsg(t.errorPrefix + event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleTranscript = async (text) => {
    try {
      setStatusMsg(t.processing);
      const nextField = getNextEmptyField(profile);
      const updatedProfile = { ...profile, [nextField]: text };
      setProfile(updatedProfile);

      const qRes = await axios.post(API_BASE + "/next-question", updatedProfile);
      if (qRes.data.intake_complete) {
        setIntakeComplete(true);
        setCurrentQuestion(t.recommendationReady);
        await handleGetRecommendation(updatedProfile);
      } else {
        const followingField = getNextEmptyField(updatedProfile);
        setCurrentQuestion(t.questions[followingField]);
      }
      setStatusMsg("");
    } catch (err) {
      setStatusMsg(t.errorPrefix + err.message);
    }
  };

  const handleGetRecommendation = async (finalProfile) => {
    try {
      const res = await axios.post(API_BASE + "/recommend", finalProfile);
      setRecommendation(res.data);
      const spokenText = "Recommendation: " + res.data.nsqf_course + ", trade: " + res.data.trade;
      speakText(spokenText, finalProfile.language);
      await saveBeneficiary(finalProfile, res.data);
    } catch (err) {
      setStatusMsg(t.errorPrefix + err.message);
    }
  };

  const saveBeneficiary = async (finalProfile, rec) => {
    try {
      await axios.post(API_BASE + "/save-beneficiary", { profile: finalProfile, recommendation: rec });
      setSaved(true);
    } catch (err) {
      setStatusMsg(t.errorPrefix + err.message);
    }
  };

  const speakText = (text, lang) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG_CODES[lang] || "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadBeneficiaries = async () => {
    setDashboardLoading(true);
    try {
      const res = await axios.get(API_BASE + "/beneficiaries");
      setBeneficiaries(res.data);
    } catch (err) {
      console.error(err);
    }
    setDashboardLoading(false);
  };

  const takeOfficerAction = async (id, action) => {
    try {
      await axios.post(API_BASE + "/beneficiaries/" + id + "/action", { action });
      await loadBeneficiaries();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === "dashboard") loadBeneficiaries();
  }, [view]);

  const progressCount = fieldOrder.filter((f) => profile[f]).length;

  const statusLabel = (b) => {
    if (b.officer_action === "approved") return t.officerApproved;
    if (b.officer_action === "reassigned") return t.officerReassigned;
    if (b.needs_human_review) return t.needsReview;
    return t.approved;
  };

  const statusClass = (b) => {
    if (b.officer_action === "approved") return "status-pill approved";
    if (b.officer_action === "reassigned") return "status-pill reassigned";
    if (b.needs_human_review) return "status-pill review";
    return "status-pill approved";
  };

  const districtLabel = (d) => {
    if (!d) return "-";
    const match = districts.find((x) => x.key === d);
    if (!match) return d;
    return profile.language === "hi" ? match.label_hi : match.label_en;
  };

  const renderConversation = () => (
    <>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: ((progressCount / fieldOrder.length) * 100) + "%" }} />
      </div>
      <p className="progress-text">{progressCount} / {fieldOrder.length} {t.progressSuffix}</p>

      {!intakeComplete && (
        <div className="conversation-card">
          <p className="question">{currentQuestion}</p>
          {!isRecording ? (
            <button className="record-btn" onClick={startRecording}>{t.startRecording}</button>
          ) : (
            <button className="record-btn recording" onClick={stopRecording}>{t.recording}</button>
          )}
          {statusMsg && <p className="status">{statusMsg}</p>}
          {transcript && <p className="transcript">{t.youSaid}"{transcript}"</p>}
        </div>
      )}

      {intakeComplete && recommendation && (
        <div className="recommendation-card">
          <h2>{t.recommendationTitle}</h2>
          <p><strong>{t.course}:</strong> {recommendation.nsqf_course}</p>
          <p><strong>{t.trade}:</strong> {recommendation.trade}</p>
          <p><strong>{t.confidenceLabel}:</strong> {(recommendation.confidence * 100).toFixed(0)}%</p>
          {recommendation.needs_human_review ? (
            <p className="status-badge review">{t.reviewPending}</p>
          ) : (
            <p className="status-badge approved">{t.autoApproved}</p>
          )}
          {recommendation.skill_gap_note && <p className="skill-gap-note">{recommendation.skill_gap_note}</p>}
          {recommendation.local_demand_note && <p className="demand-note">{recommendation.local_demand_note}</p>}
          {saved && <p className="saved-msg">{t.savedMsg}</p>}
        </div>
      )}
    </>
  );

  return (
    <div className="app-container">
      <h1>SAARTHI</h1>
      <p className="tagline">{t.tagline}</p>
      <p className="pmajay-note">PM-AJAY GIA beneficiaries ke liye banaya gaya</p>

      <div className="lang-select">
        <label htmlFor="lang">{t.languageLabel}: </label>
        <select id="lang" value={profile.language} onChange={handleLanguageChange}>
          {Object.keys(LANG_NATIVE_NAMES).map((code) => (
            <option key={code} value={code}>{LANG_NATIVE_NAMES[code]}</option>
          ))}
        </select>

        <label htmlFor="district" style={{ marginLeft: "16px" }}>{t.districtLabel}: </label>
        <select id="district" value={profile.district} onChange={handleDistrictChange}>
          <option value="">{t.districtNone}</option>
          {districts.map((d) => (
            <option key={d.key} value={d.key}>
              {profile.language === "hi" ? d.label_hi : d.label_en}
            </option>
          ))}
        </select>
      </div>

      <div className="nav-tabs">
        <button className={view === "intake" ? "tab-btn active" : "tab-btn"} onClick={() => setView("intake")}>{t.navIntake}</button>
        <button className={view === "ivr" ? "tab-btn active" : "tab-btn"} onClick={() => setView("ivr")}>{t.navIVR}</button>
        <button className={view === "dashboard" ? "tab-btn active" : "tab-btn"} onClick={() => setView("dashboard")}>{t.navDashboard}</button>
      </div>

      {view === "intake" && renderConversation()}

      {view === "ivr" && (
        <div className="ivr-wrap">
          {!callConnected ? (
            <div className="ivr-incoming">
              <div className="pulse-avatar">Call</div>
              <p className="incoming-text">{t.incomingCall}</p>
              <button className="connect-btn" onClick={() => setCallConnected(true)}>{t.connectBtn}</button>
            </div>
          ) : (
            <div className="ivr-phone-frame">
              <div className="ivr-status-bar">
                <span className="ivr-dot"></span> {t.connected}
                <button className="hangup-btn" onClick={() => setCallConnected(false)}>{t.hangUp}</button>
              </div>
              {renderConversation()}
            </div>
          )}
          <p className="ivr-note">{t.ivrNote}</p>
        </div>
      )}

      {view === "dashboard" && (
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>{t.dashboardTitle}</h2>
            <button className="refresh-btn" onClick={loadBeneficiaries}>{t.refresh}</button>
          </div>
          {dashboardLoading && <p className="status">{t.loading}</p>}
          {!dashboardLoading && beneficiaries.length === 0 && <p className="status">{t.noBeneficiaries}</p>}
          {!dashboardLoading && beneficiaries.length > 0 && (
            <div className="table-wrap">
              <table className="beneficiary-table">
                <thead>
                  <tr>
                    <th>{t.colDate}</th><th>{t.colDistrict}</th><th>{t.colEducation}</th>
                    <th>{t.colOccupation}</th><th>{t.colCourse}</th><th>{t.colTrade}</th>
                    <th>{t.colConfidence}</th><th>{t.colStatus}</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((b) => (
                    <>
                      <tr key={b.id} className="clickable-row" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                        <td>{new Date(b.created_at).toLocaleString()}</td>
                        <td>{districtLabel(b.district)}</td>
                        <td>{b.education}</td>
                        <td>{b.current_livelihood}</td>
                        <td>{b.nsqf_course}</td>
                        <td>{b.trade}</td>
                        <td>{(b.confidence * 100).toFixed(0)}%</td>
                        <td><span className={statusClass(b)}>{statusLabel(b)}</span></td>
                        <td>
                          {b.needs_human_review && !b.officer_action && (
                            <div className="action-btns" onClick={(e) => e.stopPropagation()}>
                              <button className="approve-btn" onClick={() => takeOfficerAction(b.id, "approved")}>{t.approveBtn}</button>
                              <button className="reassign-btn" onClick={() => takeOfficerAction(b.id, "reassigned")}>{t.reassignBtn}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedId === b.id && (
                        <tr className="detail-row">
                          <td colSpan="9">
                            <div className="detail-panel">
                              <h4>{t.detailsTitle}</h4>
                              <p><strong>{t.fam}:</strong> {b.family_occupation}</p>
                              <p><strong>{t.skills}:</strong> {b.skills_interests}</p>
                              <p><strong>{t.mobility}:</strong> {b.mobility_constraints}</p>
                              <p><strong>{t.empPref}:</strong> {b.employment_preference}</p>
                              <p><strong>{t.localAware}:</strong> {b.local_opportunity_awareness}</p>
                              <button className="close-btn" onClick={() => setExpandedId(null)}>{t.close}</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
'@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText("$PSScriptRoot\App.jsx", $appJsxContent, $utf8NoBom)
Write-Host "App.jsx rewritten with 9 languages successfully."
'@ | Out-Null`