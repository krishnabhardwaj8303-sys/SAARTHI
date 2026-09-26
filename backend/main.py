from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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
    for col in ["officer_action TEXT", "action_at TEXT", "skill_gap_note TEXT"]:
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
    language: str = "hi"

class Recommendation(BaseModel):
    nsqf_course: str
    trade: str
    confidence: float
    needs_human_review: bool
    skill_gap_note: str = ""

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

SKILL_GAP_NOTES = {
    "hi": {
        "no_match": "Aapke jawabon se koi clear trade match nahi mila. Field officer ke saath basic career-counselling session recommend kiya jaata hai.",
        "low": "Match mila hai lekin confidence kam hai — training shuru karne se pehle ek chhoti foundational/orientation session helpful ho sakti hai.",
        "none": ""
    },
    "en": {
        "no_match": "No clear trade match found from your answers. A basic career-counselling session with a field officer is recommended.",
        "low": "A match was found but confidence is low — a short foundational/orientation session before enrolling may help.",
        "none": ""
    }
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
    similarities = cosine_similarity(user_vector, _tfidf_matrix)[0]

    best_index = similarities.argmax()
    best_score = similarities[best_index]
    best_match = NSQF_CATALOGUE[best_index]

    confidence = round(float(best_score), 2)

    if confidence < 0.15:
        return Recommendation(
            nsqf_course="No confident match found",
            trade="Unknown",
            confidence=confidence,
            needs_human_review=True,
            skill_gap_note=notes["no_match"]
        )

    needs_review = confidence < 0.35
    gap_note = notes["low"] if needs_review else notes["none"]

    return Recommendation(
        nsqf_course=best_match["course"],
        trade=best_match["trade"],
        confidence=confidence,
        needs_human_review=needs_review,
        skill_gap_note=gap_note
    )

@app.get("/")
def root():
    return {"status": "SAARTHI backend running"}

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
            language, nsqf_course, trade, confidence, needs_human_review,
            skill_gap_note, officer_action, action_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.profile.education, data.profile.family_occupation, data.profile.current_livelihood,
        data.profile.skills_interests, data.profile.mobility_constraints,
        data.profile.employment_preference, data.profile.local_opportunity_awareness,
        data.profile.language, data.recommendation.nsqf_course, data.recommendation.trade,
        data.recommendation.confidence, int(data.recommendation.needs_human_review),
        data.recommendation.skill_gap_note, None, None,
        datetime.now().isoformat()
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
