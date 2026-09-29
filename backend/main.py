from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from district_data import STATES_AND_DISTRICTS

app = FastAPI(title="SAARTHI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "saarthi.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS beneficiaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            education TEXT,
            family_occupation TEXT,
            current_livelihood TEXT,
            skills_interests TEXT,
            mobility_constraints TEXT,
            employment_preference TEXT,
            local_opportunity_awareness TEXT,
            district TEXT,
            language TEXT,
            nsqf_course TEXT,
            trade TEXT,
            confidence REAL,
            needs_human_review INTEGER,
            skill_gap_note TEXT,
            officer_action TEXT,
            action_at TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    for col in ["officer_action TEXT", "action_at TEXT", "skill_gap_note TEXT", "district TEXT", "state TEXT"]:
        try:
            cur.execute(f"ALTER TABLE beneficiaries ADD COLUMN {col}")
            conn.commit()
        except sqlite3.OperationalError:
            pass
    conn.close()

init_db()

class BeneficiaryProfile(BaseModel):
    education: str = ""
    family_occupation: str = ""
    current_livelihood: str = ""
    skills_interests: str = ""
    mobility_constraints: str = ""
    employment_preference: str = ""
    local_opportunity_awareness: str = ""
    state: str = ""
    district: str = ""
    language: str = "hi"

class Recommendation(BaseModel):
    nsqf_course: str
    trade: str
    confidence: float
    needs_human_review: bool
    skill_gap_note: str = ""
    local_demand_note: str = ""

class SaveBeneficiaryRequest(BaseModel):
    profile: BeneficiaryProfile
    recommendation: Recommendation

class OfficerActionRequest(BaseModel):
    action: str  # "approved" or "reassigned"

REQUIRED_FIELDS = [
    "education", "family_occupation", "current_livelihood",
    "skills_interests", "mobility_constraints",
    "employment_preference", "local_opportunity_awareness"
]

def get_next_question(profile: BeneficiaryProfile) -> str:
    questions = {
        "education": "Aapne kitni padhai ki hai?",
        "family_occupation": "Aapke ghar mein parivar ka pehle se kaunsa kaam hota hai?",
        "current_livelihood": "Abhi aap kya kaam karte hain?",
        "skills_interests": "Aapko kaunsa kaam karna pasand hai ya aap kya seekhna chahte hain?",
        "mobility_constraints": "Kya aapko kahin aane-jaane mein koi dikkat hai?",
        "employment_preference": "Aap khud ka kaam shuru karna chahenge ya naukri?",
        "local_opportunity_awareness": "Aapke area mein kaunse kaam-dhandhe available hain, aapko pata hai?"
    }
    for field in REQUIRED_FIELDS:
        if not getattr(profile, field):
            return questions[field]
    return ""

NSQF_CATALOGUE = [
    {"course": "Tailoring Level 3", "trade": "Textile", "keywords": "silai tailoring kapda cloth stitching dress making blouse"},
    {"course": "Electrician Level 4", "trade": "Electrical", "keywords": "bijli electrician wiring current electrical fitting switch board"},
    {"course": "Plumbing Level 3", "trade": "Construction", "keywords": "plumber pipe paani pani water fitting nal tap leak"},
    {"course": "Carpentry Level 3", "trade": "Woodwork", "keywords": "carpenter lakdi wood furniture badhai wooden work"},
    {"course": "Welding Level 4", "trade": "Metal Work", "keywords": "welding weld lohar iron steel gas cutting metal joint"},
    {"course": "Masonry Level 3", "trade": "Construction", "keywords": "mason rajmistri construction ghar building cement wall"},
    {"course": "Beauty and Wellness Level 3", "trade": "Beauty", "keywords": "parlour beauty makeup salon facial haircut mehndi"},
    {"course": "Food Processing Level 3", "trade": "FoodTech", "keywords": "khana food processing pickle achar papad cooking canning"},
    {"course": "Agri-Entrepreneurship Level 4", "trade": "Agriculture", "keywords": "kheti farming agri crop fasal khet farmer"},
    {"course": "Dairy Farming Level 3", "trade": "Dairy", "keywords": "doodh milk dairy gaay cow bhains buffalo pashupalan"},
    {"course": "Poultry Farming Level 3", "trade": "Animal Husbandry", "keywords": "murgi poultry chicken anda egg farming"},
    {"course": "Handicrafts and Embroidery Level 3", "trade": "Handicraft", "keywords": "handicraft craft embroidery kadhai handmade art bunai"},
    {"course": "Handloom Weaving Level 3", "trade": "Textile", "keywords": "weaving bunai loom handloom saree cloth fabric"},
    {"course": "Pottery Making Level 3", "trade": "Handicraft", "keywords": "pottery mitti clay kumhar matka pot making"},
    {"course": "Mobile Repair Technician Level 4", "trade": "Electronics", "keywords": "mobile phone repair mechanic electronics fix screen"},
    {"course": "DTP and Computer Operator Level 4", "trade": "IT/ITES", "keywords": "computer typing dtp office data entry printing"},
    {"course": "Retail Sales Associate Level 3", "trade": "Retail", "keywords": "dukaan shop retail sales customer bikri counter"},
    {"course": "Security Guard Level 3", "trade": "Security Services", "keywords": "security guard chowkidar watchman surakshaa"},
    {"course": "General Duty Assistant (Health) Level 4", "trade": "Healthcare", "keywords": "nursing health hospital patient care marij seva"},
    {"course": "Solar Panel Installation Level 4", "trade": "Renewable Energy", "keywords": "solar panel installation surya urja renewable energy"},
    {"course": "Hospitality and Tourism Level 3", "trade": "Hospitality", "keywords": "hotel tourism hospitality guest room service tour guide"},
    {"course": "Bakery and Confectionery Level 3", "trade": "FoodTech", "keywords": "bakery cake bread biscuit sweet mithai baking"},
    {"course": "Fisheries Level 3", "trade": "Fisheries", "keywords": "machli fish fishing pond talab fisheries"},
    {"course": "Horticulture Level 3", "trade": "Agriculture", "keywords": "bagwani horticulture fruit phal vegetable sabzi garden"},
    {"course": "Two Wheeler Mechanic Level 4", "trade": "Automotive", "keywords": "gaadi bike mechanic vehicle repair scooter motorcycle"},
    {"course": "Screen Printing Level 3", "trade": "Printing", "keywords": "printing screen print tshirt design banner"},
]

_course_texts = [entry["keywords"] for entry in NSQF_CATALOGUE]
_vectorizer = TfidfVectorizer()
_tfidf_matrix = _vectorizer.fit_transform(_course_texts)

DISTRICT_OPPORTUNITIES = {
    "raipur": {
        "label_hi": "रायपुर",
        "label_en": "Raipur",
        "high_demand_trades": ["Electrician Level 4", "Retail Sales Associate Level 3", "Mobile Repair Technician Level 4", "DTP and Computer Operator Level 4"]
    },
    "bastar": {
        "label_hi": "बस्तर",
        "label_en": "Bastar",
        "high_demand_trades": ["Handicrafts and Embroidery Level 3", "Handloom Weaving Level 3", "Agri-Entrepreneurship Level 4", "Horticulture Level 3"]
    },
    "durg": {
        "label_hi": "दुर्ग",
        "label_en": "Durg",
        "high_demand_trades": ["Welding Level 4", "Two Wheeler Mechanic Level 4", "Masonry Level 3", "Solar Panel Installation Level 4"]
    },
    "bilaspur": {
        "label_hi": "बिलासपुर",
        "label_en": "Bilaspur",
        "high_demand_trades": ["Tailoring Level 3", "Food Processing Level 3", "Dairy Farming Level 3", "General Duty Assistant (Health) Level 4"]
    },
    "korba": {
        "label_hi": "कोरबा",
        "label_en": "Korba",
        "high_demand_trades": ["Welding Level 4", "Electrician Level 4", "Two Wheeler Mechanic Level 4", "Security Guard Level 3"]
    },
    "rajnandgaon": {
        "label_hi": "राजनांदगांव",
        "label_en": "Rajnandgaon",
        "high_demand_trades": ["Handloom Weaving Level 3", "Agri-Entrepreneurship Level 4", "Tailoring Level 3", "Poultry Farming Level 3"]
    },
    "jagdalpur": {
        "label_hi": "जगदलपुर",
        "label_en": "Jagdalpur",
        "high_demand_trades": ["Handicrafts and Embroidery Level 3", "Horticulture Level 3", "Hospitality and Tourism Level 3", "Pottery Making Level 3"]
    },
    "ambikapur": {
        "label_hi": "अंबिकापुर",
        "label_en": "Ambikapur",
        "high_demand_trades": ["Agri-Entrepreneurship Level 4", "Dairy Farming Level 3", "Carpentry Level 3", "Food Processing Level 3"]
    },
    "dhamtari": {
        "label_hi": "धमतरी",
        "label_en": "Dhamtari",
        "high_demand_trades": ["Horticulture Level 3", "Dairy Farming Level 3", "Fisheries Level 3", "Retail Sales Associate Level 3"]
    },
    "mahasamund": {
        "label_hi": "महासमुंद",
        "label_en": "Mahasamund",
        "high_demand_trades": ["Agri-Entrepreneurship Level 4", "Tailoring Level 3", "Bakery and Confectionery Level 3", "Retail Sales Associate Level 3"]
    },
    "kanker": {
        "label_hi": "कांकेर",
        "label_en": "Kanker",
        "high_demand_trades": ["Handicrafts and Embroidery Level 3", "Horticulture Level 3", "Poultry Farming Level 3", "General Duty Assistant (Health) Level 4"]
    },
    "kabirdham": {
        "label_hi": "कबीरधाम",
        "label_en": "Kabirdham",
        "high_demand_trades": ["Dairy Farming Level 3", "Agri-Entrepreneurship Level 4", "Masonry Level 3", "Two Wheeler Mechanic Level 4"]
    },
    "bemetara": {
        "label_hi": "बेमेतरा",
        "label_en": "Bemetara",
        "high_demand_trades": ["Agri-Entrepreneurship Level 4", "Welding Level 4", "Electrician Level 4", "Food Processing Level 3"]
    },
    "balodabazar": {
        "label_hi": "बलौदाबाजार",
        "label_en": "Balodabazar",
        "high_demand_trades": ["Masonry Level 3", "Welding Level 4", "Two Wheeler Mechanic Level 4", "Retail Sales Associate Level 3"]
    },
    "surajpur": {
        "label_hi": "सूरजपुर",
        "label_en": "Surajpur",
        "high_demand_trades": ["Solar Panel Installation Level 4", "Agri-Entrepreneurship Level 4", "Electrician Level 4", "Carpentry Level 3"]
    },
}

DEMAND_BOOST = 0.12

SKILL_GAP_NOTES = {
    "hi": {
        "no_match": "Aapke jawabon se koi clear trade match nahi mila. Field officer ke saath basic career-counselling session recommend kiya jaata hai.",
        "low": "Match mila hai lekin confidence kam hai - training shuru karne se pehle ek chhoti foundational session helpful ho sakti hai.",
    },
    "en": {
        "no_match": "No clear trade match found from your answers. A basic career-counselling session with a field officer is recommended.",
        "low": "A match was found but confidence is low - a short foundational session before enrolling may help.",
    },
    "mr": {
        "no_match": "तुमच्या उत्तरांवरून कोणतीही स्पष्ट व्यवसाय जुळणी सापडली नाही. फील्ड ऑफिसरसोबत मूलभूत करिअर-सल्ला सत्राची शिफारस केली जाते.",
        "low": "जुळणी सापडली आहे पण विश्वास पातळी कमी आहे - प्रशिक्षण सुरू करण्यापूर्वी एक छोटे मूलभूत सत्र उपयुक्त ठरू शकते.",
    },
    "bn": {
        "no_match": "আপনার উত্তর থেকে কোনো স্পষ্ট ট্রেড মিল পাওয়া যায়নি। ফিল্ড অফিসারের সাথে একটি মৌলিক ক্যারিয়ার-কাউন্সেলিং সেশনের সুপারিশ করা হচ্ছে।",
        "low": "একটি মিল পাওয়া গেছে কিন্তু আত্মবিশ্বাসের মাত্রা কম - একটি সংক্ষিপ্ত মৌলিক সেশন সহায়ক হতে পারে।",
    },
    "ta": {
        "no_match": "உங்கள் பதில்களிலிருந்து தெளிவான தொழில் பொருத்தம் எதுவும் கிடைக்கவில்லை. கள அதிகாரியுடன் அடிப்படை ஆலோசனை அமர்வு பரிந்துரைக்கப்படுகிறது.",
        "low": "பொருத்தம் கிடைத்துள்ளது ஆனால் நம்பிக்கை நிலை குறைவாக உள்ளது - ஒரு சிறிய அடிப்படை அமர்வு பயனுள்ளதாக இருக்கும்.",
    },
    "te": {
        "no_match": "మీ సమాధానాల నుండి స్పష్టమైన వృత్తి సరిపోలిక కనుగొనబడలేదు. ఫీల్డ్ ఆఫీసర్‌తో ప్రాథమిక కెరీర్ సెషన్ సిఫార్సు చేయబడుతుంది.",
        "low": "సరిపోలిక కనుగొనబడింది కానీ నమ్మక స్థాయి తక్కువగా ఉంది - ఒక చిన్న ప్రాథమిక సెషన్ సహాయపడవచ్చు.",
    },
    "gu": {
        "no_match": "તમારા જવાબો પરથી કોઈ સ્પષ્ટ વ્યવસાય મેળ મળ્યો નથી. ફિલ્ડ ઓફિસર સાથે મૂળભૂત કારકિર્દી સત્રની ભલામણ કરવામાં આવે છે.",
        "low": "મેળ મળ્યો છે પરંતુ વિશ્વાસ સ્તર ઓછું છે - એક ટૂંકું મૂળભૂત સત્ર મદદરૂપ થઈ શકે છે.",
    },
    "pa": {
        "no_match": "ਤੁਹਾਡੇ ਜਵਾਬਾਂ ਤੋਂ ਕੋਈ ਸਪਸ਼ਟ ਕਿੱਤਾ ਮੇਲ ਨਹੀਂ ਮਿਲਿਆ। ਫੀਲਡ ਅਫਸਰ ਨਾਲ ਬੁਨਿਆਦੀ ਕਰੀਅਰ ਸੈਸ਼ਨ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
        "low": "ਮੇਲ ਮਿਲ ਗਿਆ ਹੈ ਪਰ ਭਰੋਸੇ ਦਾ ਪੱਧਰ ਘੱਟ ਹੈ - ਇੱਕ ਛੋਟਾ ਬੁਨਿਆਦੀ ਸੈਸ਼ਨ ਮਦਦਗਾਰ ਹੋ ਸਕਦਾ ਹੈ।",
    },
    "or": {
        "no_match": "ଆପଣଙ୍କ ଉତ୍ତରରୁ କୌଣସି ସ୍ପଷ୍ଟ ବୃତ୍ତି ମେଳ ମିଳିଲା ନାହିଁ। ଫିଲ୍ଡ ଅଫିସର ସହିତ ଏକ ମୌଳିକ ପରାମର୍ଶ ସେସନ ସୁପାରିଶ କରାଯାଏ।",
        "low": "ଏକ ମେଳ ମିଳିଛି କିନ୍ତୁ ବିଶ୍ୱାସ ସ୍ତର କମ୍ ଅଛି - ଏକ ଛୋଟ ମୌଳିକ ସେସନ ସହାୟକ ହୋଇପାରେ।",
    },
}

LOCAL_DEMAND_MESSAGES = {
    "hi": "yeh trade aapke district mein high-demand mein hai - job milne ke chances zyada hain.",
    "en": "this trade is in high demand in your district - job prospects are stronger here.",
    "mr": "हा व्यवसाय तुमच्या जिल्ह्यात जास्त मागणीत आहे - नोकरी मिळण्याची शक्यता जास्त आहे.",
    "bn": "এই পেশাটি আপনার জেলায় উচ্চ চাহিদায় রয়েছে - চাকরি পাওয়ার সম্ভাবনা বেশি।",
    "ta": "இந்த தொழில் உங்கள் மாவட்டத்தில் அதிக தேவையில் உள்ளது - வேலை வாய்ப்பு அதிகம்.",
    "te": "ఈ వృత్తికి మీ జిల్లాలో అధిక డిమాండ్ ఉంది - ఉద్యోగ అవకాశాలు ఎక్కువ.",
    "gu": "આ વ્યવસાય તમારા જિલ્લામાં ઉચ્ચ માંગમાં છે - નોકરી મળવાની શક્યતા વધુ છે.",
    "pa": "ਇਹ ਕਿੱਤਾ ਤੁਹਾਡੇ ਜ਼ਿਲ੍ਹੇ ਵਿੱਚ ਬਹੁਤ ਮੰਗ ਵਿੱਚ ਹੈ - ਨੌਕਰੀ ਮਿਲਣ ਦੀ ਸੰਭਾਵਨਾ ਵਧੇਰੇ ਹੈ।",
    "or": "ଏହି ବୃତ୍ତି ଆପଣଙ୍କ ଜିଲ୍ଲାରେ ଅଧିକ ଚାହିଦାରେ ଅଛି - ଚାକିରି ମିଳିବାର ସମ୍ଭାବନା ଅଧିକ।",
}

def match_recommendation(profile: BeneficiaryProfile) -> Recommendation:
    text_blob = f"{profile.skills_interests} {profile.family_occupation} {profile.current_livelihood} {profile.local_opportunity_awareness}".lower().strip()
    lang = profile.language if profile.language in SKILL_GAP_NOTES else "hi"
    notes = SKILL_GAP_NOTES[lang]

    if not text_blob:
        return Recommendation(
            nsqf_course="No confident match found",
            trade="Unknown",
            confidence=0.0,
            needs_human_review=True,
            skill_gap_note=notes["no_match"]
        )

    user_vector = _vectorizer.transform([text_blob])
    similarities = cosine_similarity(user_vector, _tfidf_matrix)[0].copy()

    state_key = profile.state.strip().lower()
    district_key = profile.district.strip().lower()
    boosted_courses = set()
    if state_key in STATES_AND_DISTRICTS:
        districts = STATES_AND_DISTRICTS[state_key]["districts"]
        if district_key in districts:
            boosted_courses = set(districts[district_key]["high_demand_trades"])
            for idx, entry in enumerate(NSQF_CATALOGUE):
                if entry["course"] in boosted_courses:
                    similarities[idx] += DEMAND_BOOST

    best_index = similarities.argmax()
    best_score = similarities[best_index]
    best_match = NSQF_CATALOGUE[best_index]
    confidence = round(float(min(best_score, 1.0)), 2)

    if confidence < 0.15:
        return Recommendation(
            nsqf_course="No confident match found",
            trade="Unknown",
            confidence=confidence,
            needs_human_review=True,
            skill_gap_note=notes["no_match"]
        )

    needs_review = confidence < 0.35
    gap_note = notes["low"] if needs_review else ""

    demand_note = ""
    if best_match["course"] in boosted_courses:
        demand_note = LOCAL_DEMAND_MESSAGES.get(lang, LOCAL_DEMAND_MESSAGES["hi"])

    return Recommendation(
        nsqf_course=best_match["course"],
        trade=best_match["trade"],
        confidence=confidence,
        needs_human_review=needs_review,
        skill_gap_note=gap_note,
        local_demand_note=demand_note
    )

@app.get("/")
def root():
    return {"status": "SAARTHI backend running"}

@app.get("/states")
def get_states():
    return [
        {"key": k, "label_hi": v["label_hi"], "label_en": v["label_en"]}
        for k, v in STATES_AND_DISTRICTS.items()
    ]

@app.get("/districts")
def get_districts(state: str = ""):
    if not state or state not in STATES_AND_DISTRICTS:
        return []
    districts = STATES_AND_DISTRICTS[state]["districts"]
    return [
        {"key": k, "label_hi": v["label_hi"], "label_en": v["label_en"]}
        for k, v in districts.items()
    ]

@app.post("/next-question")
def next_question(profile: BeneficiaryProfile):
    question = get_next_question(profile)
    return {"next_question": question, "intake_complete": question == ""}

@app.post("/recommend")
def recommend(profile: BeneficiaryProfile):
    result = match_recommendation(profile)
    return result

@app.post("/save-beneficiary")
def save_beneficiary(data: SaveBeneficiaryRequest):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO beneficiaries (
            education, family_occupation, current_livelihood, skills_interests,
            mobility_constraints, employment_preference, local_opportunity_awareness,
            district, state, language, nsqf_course, trade, confidence, needs_human_review,
            skill_gap_note, officer_action, action_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.profile.education, data.profile.family_occupation, data.profile.current_livelihood,
        data.profile.skills_interests, data.profile.mobility_constraints,
        data.profile.employment_preference, data.profile.local_opportunity_awareness,
        data.profile.district, data.profile.state, data.profile.language, data.recommendation.nsqf_course,
        data.recommendation.trade, data.recommendation.confidence,
        int(data.recommendation.needs_human_review), data.recommendation.skill_gap_note,
        None, None, datetime.now().isoformat()
    ))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"status": "saved", "id": new_id}

@app.get("/beneficiaries")
def list_beneficiaries():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM beneficiaries ORDER BY id DESC")
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows

@app.post("/beneficiaries/{beneficiary_id}/action")
def take_action(beneficiary_id: int, req: OfficerActionRequest):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE beneficiaries SET officer_action = ?, action_at = ? WHERE id = ?",
        (req.action, datetime.now().isoformat(), beneficiary_id)
    )
    conn.commit()
    conn.close()
    return {"status": "updated", "id": beneficiary_id, "action": req.action}