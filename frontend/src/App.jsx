import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8000";

const TRANSLATIONS = {
  hi: {
    tagline: "आपकी आवाज़, आपका रास्ता",
    languageLabel: "भाषा चुनें",
    navIntake: "आवाज़ इनपुट",
    navDashboard: "फील्ड ऑफिसर डैशबोर्ड",
    progressSuffix: "प्रश्न पूरे हुए",
    startRecording: "🎙️ बोलना शुरू करें",
    recording: "⏹️ सुन रहा हूँ...",
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
    reviewPending: "⚠️ फील्ड ऑफिसर समीक्षा लंबित — स्वचालित विश्वास स्तर कम था",
    autoApproved: "✅ स्वतः स्वीकृत",
    savedMsg: "रिकॉर्ड डैशबोर्ड में सेव हो गया।",
    dashboardTitle: "लाभार्थी",
    refresh: "रीफ्रेश करें",
    loading: "लोड हो रहा है...",
    noBeneficiaries: "अभी तक कोई लाभार्थी सेव नहीं हुआ।",
    colDate: "तारीख़",
    colEducation: "शिक्षा",
    colOccupation: "व्यवसाय",
    colCourse: "कोर्स",
    colTrade: "ट्रेड",
    colConfidence: "विश्वास स्तर",
    colStatus: "स्थिति",
    needsReview: "समीक्षा आवश्यक",
    approved: "स्वतः स्वीकृत",
    officerApproved: "अधिकारी द्वारा स्वीकृत",
    officerReassigned: "पुनः असाइन किया गया",
    approveBtn: "स्वीकृत करें",
    reassignBtn: "पुनः असाइन करें",
    detailsTitle: "पूरी प्रोफ़ाइल",
    close: "बंद करें",
    fam: "पारिवारिक व्यवसाय",
    skills: "रुचियाँ / कौशल",
    mobility: "आवागमन बाधाएँ",
    empPref: "रोजगार वरीयता",
    localAware: "स्थानीय अवसर जानकारी",
    greeting: "नमस्ते! चलिए शुरू करते हैं। आपने कितनी पढ़ाई की है?",
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
    navIntake: "Voice Intake",
    navDashboard: "Field Officer Dashboard",
    progressSuffix: "questions completed",
    startRecording: "🎙️ Start Speaking",
    recording: "⏹️ Listening...",
    unsupportedBrowser: "Voice recognition isn't supported in this browser. Please use Chrome.",
    listening: "Listening... please speak",
    processing: "Processing...",
    errorPrefix: "Error: ",
    youSaid: "You said: ",
    recommendationReady: "Thank you! Preparing your recommendation now...",
    recommendationTitle: "Your Recommendation",
    course: "NSQF Course",
    trade: "Trade",
    confidenceLabel: "Confidence",
    reviewPending: "⚠️ Field officer review pending — automated confidence was low",
    autoApproved: "✅ Auto-Approved",
    savedMsg: "Record saved to dashboard.",
    dashboardTitle: "Beneficiaries",
    refresh: "Refresh",
    loading: "Loading...",
    noBeneficiaries: "No beneficiaries saved yet.",
    colDate: "Date",
    colEducation: "Education",
    colOccupation: "Occupation",
    colCourse: "Course",
    colTrade: "Trade",
    colConfidence: "Confidence",
    colStatus: "Status",
    needsReview: "Needs Review",
    approved: "Auto-Approved",
    officerApproved: "Approved by Officer",
    officerReassigned: "Reassigned",
    approveBtn: "Approve",
    reassignBtn: "Reassign",
    detailsTitle: "Full Profile",
    close: "Close",
    fam: "Family Occupation",
    skills: "Skills / Interests",
    mobility: "Mobility Constraints",
    empPref: "Employment Preference",
    localAware: "Local Opportunity Awareness",
    greeting: "Hello! Let's get started. How much education have you completed?",
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
};

function App() {
  const [view, setView] = useState("intake"); // "intake" | "dashboard"

  const [profile, setProfile] = useState({
    education: "",
    family_occupation: "",
    current_livelihood: "",
    skills_interests: "",
    mobility_constraints: "",
    employment_preference: "",
    local_opportunity_awareness: "",
    language: "hi",
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
    "education",
    "family_occupation",
    "current_livelihood",
    "skills_interests",
    "mobility_constraints",
    "employment_preference",
    "local_opportunity_awareness",
  ];

  const getNextEmptyField = (p) => fieldOrder.find((f) => !p[f]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setProfile((prev) => ({ ...prev, language: newLang }));
    const started = fieldOrder.some((f) => profile[f]);
    if (!started && !intakeComplete) {
      setCurrentQuestion(TRANSLATIONS[newLang].greeting);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMsg(t.unsupportedBrowser);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = profile.language === "hi" ? "hi-IN" : "en-IN";
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

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTranscript = async (text) => {
    try {
      setStatusMsg(t.processing);

      const nextField = getNextEmptyField(profile);
      const updatedProfile = { ...profile, [nextField]: text };
      setProfile(updatedProfile);

      const qRes = await axios.post(`${API_BASE}/next-question`, updatedProfile);
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
      const res = await axios.post(`${API_BASE}/recommend`, finalProfile);
      setRecommendation(res.data);
      const spokenLang = finalProfile.language;
      const spokenText =
        spokenLang === "hi"
          ? `Aapke liye recommendation hai ${res.data.nsqf_course}, trade ${res.data.trade} mein.`
          : `Your recommendation is ${res.data.nsqf_course}, in the ${res.data.trade} trade.`;
      speakText(spokenText, spokenLang);
      await saveBeneficiary(finalProfile, res.data);
    } catch (err) {
      setStatusMsg(t.errorPrefix + err.message);
    }
  };

  const saveBeneficiary = async (finalProfile, rec) => {
    try {
      await axios.post(`${API_BASE}/save-beneficiary`, {
        profile: finalProfile,
        recommendation: rec,
      });
      setSaved(true);
    } catch (err) {
      setStatusMsg(t.errorPrefix + err.message);
    }
  };

  const speakText = (text, lang) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadBeneficiaries = async () => {
    setDashboardLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/beneficiaries`);
      setBeneficiaries(res.data);
    } catch (err) {
      console.error(err);
    }
    setDashboardLoading(false);
  };

  const takeOfficerAction = async (id, action) => {
    try {
      await axios.post(`${API_BASE}/beneficiaries/${id}/action`, { action });
      await loadBeneficiaries();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === "dashboard") {
      loadBeneficiaries();
    }
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

  return (
    <div className="app-container">
      <h1>SAARTHI</h1>
      <p className="tagline">{t.tagline}</p>

      <div className="lang-select">
        <label htmlFor="lang">{t.languageLabel}: </label>
        <select id="lang" value={profile.language} onChange={handleLanguageChange}>
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="nav-tabs">
        <button
          className={view === "intake" ? "tab-btn active" : "tab-btn"}
          onClick={() => setView("intake")}
        >
          {t.navIntake}
        </button>
        <button
          className={view === "dashboard" ? "tab-btn active" : "tab-btn"}
          onClick={() => setView("dashboard")}
        >
          {t.navDashboard}
        </button>
      </div>

      {view === "intake" && (
        <>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progressCount / fieldOrder.length) * 100}%` }}
            />
          </div>
          <p className="progress-text">{progressCount} / {fieldOrder.length} {t.progressSuffix}</p>

          {!intakeComplete && (
            <div className="conversation-card">
              <p className="question">{currentQuestion}</p>

              {!isRecording ? (
                <button className="record-btn" onClick={startRecording}>
                  {t.startRecording}
                </button>
              ) : (
                <button className="record-btn recording" onClick={stopRecording}>
                  {t.recording}
                </button>
              )}

              {statusMsg && <p className="status">{statusMsg}</p>}
              {transcript && (
                <p className="transcript">{t.youSaid}"{transcript}"</p>
              )}
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
              {saved && <p className="saved-msg">{t.savedMsg}</p>}
            </div>
          )}
        </>
      )}

      {view === "dashboard" && (
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>{t.dashboardTitle}</h2>
            <button className="refresh-btn" onClick={loadBeneficiaries}>{t.refresh}</button>
          </div>

          {dashboardLoading && <p className="status">{t.loading}</p>}

          {!dashboardLoading && beneficiaries.length === 0 && (
            <p className="status">{t.noBeneficiaries}</p>
          )}

          {!dashboardLoading && beneficiaries.length > 0 && (
            <div className="table-wrap">
              <table className="beneficiary-table">
                <thead>
                  <tr>
                    <th>{t.colDate}</th>
                    <th>{t.colEducation}</th>
                    <th>{t.colOccupation}</th>
                    <th>{t.colCourse}</th>
                    <th>{t.colTrade}</th>
                    <th>{t.colConfidence}</th>
                    <th>{t.colStatus}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((b) => (
                    <>
                      <tr
                        key={b.id}
                        className="clickable-row"
                        onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                      >
                        <td>{new Date(b.created_at).toLocaleString()}</td>
                        <td>{b.education}</td>
                        <td>{b.current_livelihood}</td>
                        <td>{b.nsqf_course}</td>
                        <td>{b.trade}</td>
                        <td>{(b.confidence * 100).toFixed(0)}%</td>
                        <td>
                          <span className={statusClass(b)}>{statusLabel(b)}</span>
                        </td>
                        <td>
                          {b.needs_human_review && !b.officer_action && (
                            <div className="action-btns" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="approve-btn"
                                onClick={() => takeOfficerAction(b.id, "approved")}
                              >
                                {t.approveBtn}
                              </button>
                              <button
                                className="reassign-btn"
                                onClick={() => takeOfficerAction(b.id, "reassigned")}
                              >
                                {t.reassignBtn}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedId === b.id && (
                        <tr className="detail-row">
                          <td colSpan="8">
                            <div className="detail-panel">
                              <h4>{t.detailsTitle}</h4>
                              <p><strong>{t.fam}:</strong> {b.family_occupation}</p>
                              <p><strong>{t.skills}:</strong> {b.skills_interests}</p>
                              <p><strong>{t.mobility}:</strong> {b.mobility_constraints}</p>
                              <p><strong>{t.empPref}:</strong> {b.employment_preference}</p>
                              <p><strong>{t.localAware}:</strong> {b.local_opportunity_awareness}</p>
                              <button className="close-btn" onClick={() => setExpandedId(null)}>
                                {t.close}
                              </button>
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
