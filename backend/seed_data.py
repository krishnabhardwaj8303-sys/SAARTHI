import sqlite3
from datetime import datetime, timedelta

DB_PATH = "saarthi.db"

sample_beneficiaries = [
    {
        "education": "Class 8 tak padhai ki hai",
        "family_occupation": "Ghar mein silai ka kaam hota hai",
        "current_livelihood": "Abhi khaali baithi hoon",
        "skills_interests": "Mujhe silai aur kapda design karna pasand hai",
        "mobility_constraints": "Koi dikkat nahi hai",
        "employment_preference": "Khud ka kaam shuru karna chahti hoon",
        "local_opportunity_awareness": "Market mein tailoring shops hain",
        "district": "bilaspur", "language": "hi",
        "nsqf_course": "Tailoring Level 3", "trade": "Textile",
        "confidence": 0.62, "needs_human_review": 0,
        "skill_gap_note": "", "officer_action": None,
    },
    {
        "education": "10th pass",
        "family_occupation": "Kheti karte hain",
        "current_livelihood": "Kheti mein madad karta hoon",
        "skills_interests": "Bijli ka kaam seekhna chahta hoon, electrician banna hai",
        "mobility_constraints": "Bike hai, kahin bhi ja sakta hoon",
        "employment_preference": "Naukri chahiye",
        "local_opportunity_awareness": "Raipur mein factories hain",
        "district": "raipur", "language": "hi",
        "nsqf_course": "Electrician Level 4", "trade": "Electrical",
        "confidence": 0.71, "needs_human_review": 0,
        "skill_gap_note": "", "officer_action": None,
    },
    {
        "education": "Illiterate, school nahi gaya",
        "family_occupation": "Handicraft banate hain ghar mein",
        "current_livelihood": "Kuch nahi, ghar sambhalta hoon",
        "skills_interests": "Bunai aur handicraft mein interest hai",
        "mobility_constraints": "Dur nahi ja sakta, ghar ke paas hi kaam chahiye",
        "employment_preference": "Ghar se hi kaam karna hai",
        "local_opportunity_awareness": "Pata nahi",
        "district": "bastar", "language": "hi",
        "nsqf_course": "Handicrafts and Embroidery Level 3", "trade": "Handicraft",
        "confidence": 0.58, "needs_human_review": 0,
        "skill_gap_note": "", "officer_action": None,
    },
    {
        "education": "12th pass",
        "family_occupation": "Pita mechanic the pehle",
        "current_livelihood": "Chhote mote kaam karta hoon",
        "skills_interests": "Gaadi thik karna achha lagta hai",
        "mobility_constraints": "Nahi hai",
        "employment_preference": "Apna garage kholna chahta hoon",
        "local_opportunity_awareness": "Durg mein bahut bikes hain",
        "district": "durg", "language": "hi",
        "nsqf_course": "Two Wheeler Mechanic Level 4", "trade": "Automotive",
        "confidence": 0.29, "needs_human_review": 1,
        "skill_gap_note": "Match mila hai lekin confidence kam hai — training shuru karne se pehle ek chhoti foundational/orientation session helpful ho sakti hai.",
        "officer_action": None,
    },
    {
        "education": "5th class tak",
        "family_occupation": "Gaay bhains palte hain",
        "current_livelihood": "Doodh becha karta hoon",
        "skills_interests": "Pata nahi kya karna hai",
        "mobility_constraints": "Bahut dur nahi ja sakta",
        "employment_preference": "Jo bhi mil jaye",
        "local_opportunity_awareness": "Kuch pata nahi",
        "district": "bilaspur", "language": "hi",
        "nsqf_course": "No confident match found", "trade": "Unknown",
        "confidence": 0.08, "needs_human_review": 1,
        "skill_gap_note": "Aapke jawabon se koi clear trade match nahi mila. Field officer ke saath basic career-counselling session recommend kiya jaata hai.",
        "officer_action": None,
    },
    {
        "education": "Graduate hoon",
        "family_occupation": "No family business",
        "current_livelihood": "Computer classes le raha hoon",
        "skills_interests": "Data entry aur computer ka kaam pasand hai",
        "mobility_constraints": "Nahi hai",
        "employment_preference": "Office job chahiye",
        "local_opportunity_awareness": "Raipur mein IT companies hain",
        "district": "raipur", "language": "hi",
        "nsqf_course": "DTP and Computer Operator Level 4", "trade": "IT/ITES",
        "confidence": 0.68, "needs_human_review": 0,
        "skill_gap_note": "", "officer_action": "approved",
    },
]

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

for i, b in enumerate(sample_beneficiaries):
    created_time = (datetime.now() - timedelta(hours=len(sample_beneficiaries) - i)).isoformat()
    action_time = datetime.now().isoformat() if b["officer_action"] else None
    cur.execute("""
        INSERT INTO beneficiaries (
            education, family_occupation, current_livelihood, skills_interests,
            mobility_constraints, employment_preference, local_opportunity_awareness,
            district, language, nsqf_course, trade, confidence, needs_human_review,
            skill_gap_note, officer_action, action_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        b["education"], b["family_occupation"], b["current_livelihood"], b["skills_interests"],
        b["mobility_constraints"], b["employment_preference"], b["local_opportunity_awareness"],
        b["district"], b["language"], b["nsqf_course"], b["trade"], b["confidence"],
        b["needs_human_review"], b["skill_gap_note"], b["officer_action"], action_time, created_time
    ))

conn.commit()
conn.close()
print(f"Inserted {len(sample_beneficiaries)} sample beneficiaries into saarthi.db")
