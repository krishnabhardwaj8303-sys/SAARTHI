# SAARTHI

**Aapki awaaz, aapka rasta** — Voice-based livelihood mapping aur NSQF course recommendation system, built for Smart India Hackathon (SIH26097).

## Problem

Field officers ko rural beneficiaries ka livelihood-mapping survey karna padta hai — unki education, family occupation, skills, aur mobility constraints puchke unhe sahi NSQF (National Skills Qualification Framework) course recommend karna hota hai. Ye process manual, slow, aur literacy-dependent hai.

## Solution

SAARTHI ek voice-first web app hai jo:
1. Voice mein 7 simple sawaal poochta hai (Hindi ya English mein)
2. Har jawab ko TF-IDF similarity se 25+ NSQF trades ke against match karta hai
3. Confidence score ke basis pe auto-approve karta hai ya field officer review ke liye flag karta hai
4. Sab kuch SQLite mein save hota hai, field officer dashboard mein track hota hai

## Tech Stack

- **Backend:** FastAPI, scikit-learn (TF-IDF + cosine similarity), SQLite
- **Frontend:** React + Vite, Web Speech API (browser-native ASR + TTS)
- **Languages supported:** Hindi (हिंदी), English — full UI translation, not transliteration

## Architecture

## Key Features

- 🎙️ Voice-only intake — no typing required, works for low-literacy users
- 🌐 Full bilingual UI (Hindi/English) with live language switching
- 🎯 TF-IDF-based semantic matching, not just keyword lookup
- ⚠️ Confidence-gated human-in-the-loop safety — low-confidence matches never auto-approved
- 📊 Field officer dashboard with expandable beneficiary detail view and approve/reassign actions
- 🔊 Text-to-speech readback of the recommendation

## Setup

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in **Chrome** (Web Speech API requires Chrome/Edge — not supported in Firefox).

## Team

Built by [Your Team Name] for Smart India Hackathon 2026, Problem Statement SIH26097.
