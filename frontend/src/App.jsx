import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8000";

const TRANSLATIONS = {
  hi: {
    tagline: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤â€ Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Å“Ã Â¤Â¼, Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¾Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾",
    languageLabel: "Ã Â¤Â­Ã Â¤Â¾Ã Â¤Â·Ã Â¤Â¾ Ã Â¤Å¡Ã Â¥ÂÃ Â¤Â¨Ã Â¥â€¡Ã Â¤â€š",
    districtLabel: "Ã Â¤Å“Ã Â¤Â¿Ã Â¤Â²Ã Â¤Â¾ Ã Â¤Å¡Ã Â¥ÂÃ Â¤Â¨Ã Â¥â€¡Ã Â¤â€š",
    districtNone: "Ã Â¤Å“Ã Â¤Â¿Ã Â¤Â²Ã Â¤Â¾ Ã Â¤Å¡Ã Â¥ÂÃ Â¤Â¨Ã Â¥â€¡Ã Â¤â€š (Ã Â¤ÂµÃ Â¥Ë†Ã Â¤â€¢Ã Â¤Â²Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â¿Ã Â¤â€¢)",
    navIntake: "Ã Â¤â€ Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Å“Ã Â¤Â¼ Ã Â¤â€¡Ã Â¤Â¨Ã Â¤ÂªÃ Â¥ÂÃ Â¤Å¸",
    navIVR: "Ã Â¤Â«Ã Â¥â€¹Ã Â¤Â¨ Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â² Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Â®Ã Â¥â€¹",
    navDashboard: "Ã Â¤Â«Ã Â¥â‚¬Ã Â¤Â²Ã Â¥ÂÃ Â¤Â¡ Ã Â¤â€˜Ã Â¤Â«Ã Â¤Â¿Ã Â¤Â¸Ã Â¤Â° Ã Â¤Â¡Ã Â¥Ë†Ã Â¤Â¶Ã Â¤Â¬Ã Â¥â€¹Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¡",
    progressSuffix: "Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â¨ Ã Â¤ÂªÃ Â¥â€šÃ Â¤Â°Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥ÂÃ Â¤Â",
    startRecording: "Ã°Å¸Å½â„¢Ã¯Â¸Â Ã Â¤Â¬Ã Â¥â€¹Ã Â¤Â²Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â°Ã Â¥â€š Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š",
    recording: "Ã¢ÂÂ¹Ã¯Â¸Â Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¨ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥â€šÃ Â¤Â...",
    unsupportedBrowser: "Ã Â¤â€¡Ã Â¤Â¸ Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤â€°Ã Â¤Å“Ã Â¤Â¼Ã Â¤Â° Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¥â€°Ã Â¤â€¡Ã Â¤Â¸ Ã Â¤Â°Ã Â¤Â¿Ã Â¤â€¢Ã Â¤â€”Ã Â¥ÂÃ Â¤Â¨Ã Â¤Â¿Ã Â¤Â¶Ã Â¤Â¨ Ã Â¤Â¸Ã Â¤ÂªÃ Â¥â€¹Ã Â¤Â°Ã Â¥ÂÃ Â¤Å¸ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤Â¹Ã Â¥Ë†Ã Â¥Â¤ Ã Â¤â€¢Ã Â¥Æ’Ã Â¤ÂªÃ Â¤Â¯Ã Â¤Â¾ Chrome Ã Â¤â€¡Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¥â€¡Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â² Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€šÃ Â¥Â¤",
    listening: "Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¨ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥â€šÃ Â¤Â... Ã Â¤Â¬Ã Â¥â€¹Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â",
    processing: "Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¥â€¹Ã Â¤Â¸Ã Â¥â€¡Ã Â¤Â¸ Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†...",
    errorPrefix: "Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿: ",
    youSaid: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤Â¨Ã Â¥â€¡ Ã Â¤â€¢Ã Â¤Â¹Ã Â¤Â¾: ",
    recommendationReady: "Ã Â¤Â§Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â¯Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â¦! Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¿Ã Â¤Â«Ã Â¤Â¾Ã Â¤Â°Ã Â¤Â¿Ã Â¤Â¶ Ã Â¤Â¤Ã Â¥Ë†Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â° Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤Å“Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¹Ã Â¥â‚¬ Ã Â¤Â¹Ã Â¥Ë†...",
    recommendationTitle: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¿Ã Â¤Â«Ã Â¤Â¾Ã Â¤Â°Ã Â¤Â¿Ã Â¤Â¶",
    course: "Ã Â¤ÂÃ Â¤Â¨Ã Â¤ÂÃ Â¤Â¸Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â¯Ã Â¥â€šÃ Â¤ÂÃ Â¤Â« Ã Â¤â€¢Ã Â¥â€¹Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¸",
    trade: "Ã Â¤Å¸Ã Â¥ÂÃ Â¤Â°Ã Â¥â€¡Ã Â¤Â¡",
    confidenceLabel: "Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â¶Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â¸ Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â°",
    reviewPending: "Ã¢Å¡Â Ã¯Â¸Â Ã Â¤Â«Ã Â¥â‚¬Ã Â¤Â²Ã Â¥ÂÃ Â¤Â¡ Ã Â¤â€˜Ã Â¤Â«Ã Â¤Â¿Ã Â¤Â¸Ã Â¤Â° Ã Â¤Â¸Ã Â¤Â®Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤Â²Ã Â¤â€šÃ Â¤Â¬Ã Â¤Â¿Ã Â¤Â¤ Ã¢â‚¬â€ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â¶Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â¸ Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â° Ã Â¤â€¢Ã Â¤Â® Ã Â¤Â¥Ã Â¤Â¾",
    autoApproved: "Ã¢Å“â€¦ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¤Ã Â¤Æ’ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¥â‚¬Ã Â¤â€¢Ã Â¥Æ’Ã Â¤Â¤",
    savedMsg: "Ã Â¤Â°Ã Â¤Â¿Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¡ Ã Â¤Â¡Ã Â¥Ë†Ã Â¤Â¶Ã Â¤Â¬Ã Â¥â€¹Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤Â¸Ã Â¥â€¡Ã Â¤Âµ Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾Ã Â¥Â¤",
    dashboardTitle: "Ã Â¤Â²Ã Â¤Â¾Ã Â¤Â­Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¥Ã Â¥â‚¬",
    refresh: "Ã Â¤Â°Ã Â¥â‚¬Ã Â¤Â«Ã Â¥ÂÃ Â¤Â°Ã Â¥â€¡Ã Â¤Â¶ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š",
    loading: "Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†...",
    noBeneficiaries: "Ã Â¤â€¦Ã Â¤Â­Ã Â¥â‚¬ Ã Â¤Â¤Ã Â¤â€¢ Ã Â¤â€¢Ã Â¥â€¹Ã Â¤Ë† Ã Â¤Â²Ã Â¤Â¾Ã Â¤Â­Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¥Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¥â€¡Ã Â¤Âµ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤Â¹Ã Â¥ÂÃ Â¤â€ Ã Â¥Â¤",
    colDate: "Ã Â¤Â¤Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬Ã Â¤â€“Ã Â¤Â¼",
    colEducation: "Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾",
    colOccupation: "Ã Â¤ÂµÃ Â¥ÂÃ Â¤Â¯Ã Â¤ÂµÃ Â¤Â¸Ã Â¤Â¾Ã Â¤Â¯",
    colCourse: "Ã Â¤â€¢Ã Â¥â€¹Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¸",
    colTrade: "Ã Â¤Å¸Ã Â¥ÂÃ Â¤Â°Ã Â¥â€¡Ã Â¤Â¡",
    colConfidence: "Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â¶Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â¸ Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â°",
    colStatus: "Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¥Ã Â¤Â¿Ã Â¤Â¤Ã Â¤Â¿",
    colDistrict: "Ã Â¤Å“Ã Â¤Â¿Ã Â¤Â²Ã Â¤Â¾",
    needsReview: "Ã Â¤Â¸Ã Â¤Â®Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤â€ Ã Â¤ÂµÃ Â¤Â¶Ã Â¥ÂÃ Â¤Â¯Ã Â¤â€¢",
    approved: "Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¤Ã Â¤Æ’ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¥â‚¬Ã Â¤â€¢Ã Â¥Æ’Ã Â¤Â¤",
    officerApproved: "Ã Â¤â€¦Ã Â¤Â§Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤Â¦Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â°Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¥â‚¬Ã Â¤â€¢Ã Â¥Æ’Ã Â¤Â¤",
    officerReassigned: "Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤â€¦Ã Â¤Â¸Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â¨ Ã Â¤â€¢Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾",
    approveBtn: "Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¥â‚¬Ã Â¤â€¢Ã Â¥Æ’Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š",
    reassignBtn: "Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤â€¦Ã Â¤Â¸Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â¨ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š",
    detailsTitle: "Ã Â¤ÂªÃ Â¥â€šÃ Â¤Â°Ã Â¥â‚¬ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¥â€¹Ã Â¤Â«Ã Â¤Â¼Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â²",
    close: "Ã Â¤Â¬Ã Â¤â€šÃ Â¤Â¦ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š",
    fam: "Ã Â¤ÂªÃ Â¤Â¾Ã Â¤Â°Ã Â¤Â¿Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â°Ã Â¤Â¿Ã Â¤â€¢ Ã Â¤ÂµÃ Â¥ÂÃ Â¤Â¯Ã Â¤ÂµÃ Â¤Â¸Ã Â¤Â¾Ã Â¤Â¯",
    skills: "Ã Â¤Â°Ã Â¥ÂÃ Â¤Å¡Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â / Ã Â¤â€¢Ã Â¥Å’Ã Â¤Â¶Ã Â¤Â²",
    mobility: "Ã Â¤â€ Ã Â¤ÂµÃ Â¤Â¾Ã Â¤â€”Ã Â¤Â®Ã Â¤Â¨ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â§Ã Â¤Â¾Ã Â¤ÂÃ Â¤Â",
    empPref: "Ã Â¤Â°Ã Â¥â€¹Ã Â¤Å“Ã Â¤â€”Ã Â¤Â¾Ã Â¤Â° Ã Â¤ÂµÃ Â¤Â°Ã Â¥â‚¬Ã Â¤Â¯Ã Â¤Â¤Ã Â¤Â¾",
    localAware: "Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¥Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â‚¬Ã Â¤Â¯ Ã Â¤â€¦Ã Â¤ÂµÃ Â¤Â¸Ã Â¤Â° Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬",
    greeting: "Ã Â¤Â¨Ã Â¤Â®Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¥â€¡! Ã Â¤Å¡Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â°Ã Â¥â€š Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€šÃ Â¥Â¤ Ã Â¤â€ Ã Â¤ÂªÃ Â¤Â¨Ã Â¥â€¡ Ã Â¤â€¢Ã Â¤Â¿Ã Â¤Â¤Ã Â¤Â¨Ã Â¥â‚¬ Ã Â¤ÂªÃ Â¤Â¢Ã Â¤Â¼Ã Â¤Â¾Ã Â¤Ë† Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¹Ã Â¥Ë†?",
    incomingCall: "Ã Â¤â€ Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â²Ã Â¥â‚¬ Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â²: SAARTHI Ã Â¤Â¹Ã Â¥â€¡Ã Â¤Â²Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â¨",
    connectBtn: "Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â² Ã Â¤Å“Ã Â¥â€¹Ã Â¤Â¡Ã Â¤Â¼Ã Â¥â€¡Ã Â¤â€š",
    connected: "Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â² Ã Â¤Å“Ã Â¥ÂÃ Â¤Â¡Ã Â¤Â¼ Ã Â¤â€”Ã Â¤Ë†",
    hangUp: "Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â² Ã Â¤Â¸Ã Â¤Â®Ã Â¤Â¾Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š",
    ivrNote: "Ã Â¤Â¯Ã Â¤Â¹ Ã Â¤ÂÃ Â¤â€¢ Ã Â¤Â«Ã Â¥â€¹Ã Â¤Â¨-Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â² Ã Â¤â€ Ã Â¤Â§Ã Â¤Â¾Ã Â¤Â°Ã Â¤Â¿Ã Â¤Â¤ (IVR) Ã Â¤â€¦Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â­Ã Â¤Âµ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Â®Ã Â¥â€¹ Ã Â¤Â¹Ã Â¥Ë† Ã¢â‚¬â€ Ã Â¤Â«Ã Â¥â‚¬Ã Â¤Å¡Ã Â¤Â° Ã Â¤Â«Ã Â¥â€¹Ã Â¤Â¨ Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â¯Ã Â¥â€¹Ã Â¤â€”Ã Â¤â€¢Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤â€œÃ Â¤â€š Ã Â¤â€¢Ã Â¥â€¡ Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â, Ã Â¤Â¬Ã Â¤Â¿Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤â€¡Ã Â¤â€šÃ Â¤Å¸Ã Â¤Â°Ã Â¤Â¨Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤â€°Ã Â¤Å“Ã Â¤Â¼Ã Â¤Â° Ã Â¤â€¢Ã Â¥â€¡ Ã Â¤Â­Ã Â¥â‚¬ Ã Â¤Â¯Ã Â¤Â¹Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¿Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â® Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â® Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†Ã Â¥Â¤ Ã Â¤Â¬Ã Â¥Ë†Ã Â¤â€¢Ã Â¤ÂÃ Â¤â€šÃ Â¤Â¡ Ã Â¤ÂµÃ Â¤Â¹Ã Â¥â‚¬ Ã Â¤Â¹Ã Â¥Ë†, Ã Â¤Â¸Ã Â¤Â¿Ã Â¤Â°Ã Â¥ÂÃ Â¤Â« Ã Â¤â€¡Ã Â¤â€šÃ Â¤Å¸Ã Â¤Â°Ã Â¤Â«Ã Â¤Â¼Ã Â¥â€¡Ã Â¤Â¸ Ã Â¤â€¦Ã Â¤Â²Ã Â¤â€” Ã Â¤Â¹Ã Â¥Ë†Ã Â¥Â¤",
    questions: {
      education: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤Â¨Ã Â¥â€¡ Ã Â¤â€¢Ã Â¤Â¿Ã Â¤Â¤Ã Â¤Â¨Ã Â¥â‚¬ Ã Â¤ÂªÃ Â¤Â¢Ã Â¤Â¼Ã Â¤Â¾Ã Â¤Ë† Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¹Ã Â¥Ë†?",
      family_occupation: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¡ Ã Â¤ËœÃ Â¤Â° Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂªÃ Â¤Â°Ã Â¤Â¿Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â° Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤ÂªÃ Â¤Â¹Ã Â¤Â²Ã Â¥â€¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤â€¢Ã Â¥Å’Ã Â¤Â¨ Ã Â¤Â¸Ã Â¤Â¾ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â® Ã Â¤Â¹Ã Â¥â€¹Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†?",
      current_livelihood: "Ã Â¤â€¦Ã Â¤Â­Ã Â¥â‚¬ Ã Â¤â€ Ã Â¤Âª Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â® Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€š?",
      skills_interests: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¹ Ã Â¤â€¢Ã Â¥Å’Ã Â¤Â¨ Ã Â¤Â¸Ã Â¤Â¾ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â® Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤ÂªÃ Â¤Â¸Ã Â¤â€šÃ Â¤Â¦ Ã Â¤Â¹Ã Â¥Ë†, Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤â€ Ã Â¤Âª Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥â‚¬Ã Â¤â€“Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€š?",
      mobility_constraints: "Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¹ Ã Â¤â€¢Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤â€ Ã Â¤Â¨Ã Â¥â€¡-Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤â€¢Ã Â¥â€¹Ã Â¤Ë† Ã Â¤Â¦Ã Â¤Â¿Ã Â¤â€¢Ã Â¥ÂÃ Â¤â€¢Ã Â¤Â¤ Ã Â¤Â¹Ã Â¥Ë†?",
      employment_preference: "Ã Â¤â€ Ã Â¤Âª Ã Â¤â€“Ã Â¥ÂÃ Â¤Â¦ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â® Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â°Ã Â¥â€š Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¥â€¡Ã Â¤â€šÃ Â¤â€”Ã Â¥â€¡ Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¨Ã Â¥Å’Ã Â¤â€¢Ã Â¤Â°Ã Â¥â‚¬?",
      local_opportunity_awareness: "Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¡ Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¥â€¡Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â° Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤â€¢Ã Â¥Å’Ã Â¤Â¨ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â®-Ã Â¤Â§Ã Â¤â€šÃ Â¤Â§Ã Â¥â€¡ Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â²Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â§ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€š, Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¹ Ã Â¤ÂªÃ Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†?",
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
    startRecording: "Ã°Å¸Å½â„¢Ã¯Â¸Â Start Speaking",
    recording: "Ã¢ÂÂ¹Ã¯Â¸Â Listening...",
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
    reviewPending: "Ã¢Å¡Â Ã¯Â¸Â Field officer review pending Ã¢â‚¬â€ automated confidence was low",
    autoApproved: "Ã¢Å“â€¦ Auto-Approved",
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
    colDistrict: "District",
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
    incomingCall: "Incoming Call: SAARTHI Helpline",
    connectBtn: "Connect Call",
    connected: "Call Connected",
    hangUp: "Hang Up",
    ivrNote: "This is a demo of a phone-call based (IVR) experience Ã¢â‚¬â€ for feature-phone users, the same underlying system works without any internet browser. Same backend, different interface.",
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
  const [view, setView] = useState("intake"); // "intake" | "ivr" | "dashboard"
  const [districts, setDistricts] = useState([]);
  const [callConnected, setCallConnected] = useState(false);

  const [profile, setProfile] = useState({
    education: "",
    family_occupation: "",
    current_livelihood: "",
    skills_interests: "",
    mobility_constraints: "",
    employment_preference: "",
    local_opportunity_awareness: "",
    district: "",
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

  useEffect(() => {
    axios.get(`${API_BASE}/districts`).then((res) => setDistricts(res.data)).catch(() => {});
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

  const districtLabel = (d) => {
    if (!d) return "-";
    const match = districts.find((x) => x.key === d);
    if (!match) return d;
    return profile.language === "hi" ? match.label_hi : match.label_en;
  };

  const renderConversation = () => (
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
          {recommendation.skill_gap_note && (
            <p className="skill-gap-note">{recommendation.skill_gap_note}</p>
          )}
          {recommendation.local_demand_note && (
            <p className="demand-note">Ã°Å¸â€œË† {recommendation.local_demand_note}</p>
          )}
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
          <option value="hi">Ã Â¤Â¹Ã Â¤Â¿Ã Â¤â€šÃ Â¤Â¦Ã Â¥â‚¬</option>
          <option value="en">English</option>
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
        <button
          className={view === "intake" ? "tab-btn active" : "tab-btn"}
          onClick={() => setView("intake")}
        >
          {t.navIntake}
        </button>
        <button
          className={view === "ivr" ? "tab-btn active" : "tab-btn"}
          onClick={() => setView("ivr")}
        >
          {t.navIVR}
        </button>
        <button
          className={view === "dashboard" ? "tab-btn active" : "tab-btn"}
          onClick={() => setView("dashboard")}
        >
          {t.navDashboard}
        </button>
      </div>

      {view === "intake" && renderConversation()}

      {view === "ivr" && (
        <div className="ivr-wrap">
          {!callConnected ? (
            <div className="ivr-incoming">
              <div className="pulse-avatar">Ã°Å¸â€œÅ¾</div>
              <p className="incoming-text">{t.incomingCall}</p>
              <button className="connect-btn" onClick={() => setCallConnected(true)}>
                {t.connectBtn}
              </button>
            </div>
          ) : (
            <div className="ivr-phone-frame">
              <div className="ivr-status-bar">
                <span className="ivr-dot"></span> {t.connected}
                <button className="hangup-btn" onClick={() => setCallConnected(false)}>
                  {t.hangUp}
                </button>
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

          {!dashboardLoading && beneficiaries.length === 0 && (
            <p className="status">{t.noBeneficiaries}</p>
          )}

          {!dashboardLoading && beneficiaries.length > 0 && (
            <div className="table-wrap">
              <table className="beneficiary-table">
                <thead>
                  <tr>
                    <th>{t.colDate}</th>
                    <th>{t.colDistrict}</th>
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
                        <td>{districtLabel(b.district)}</td>
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
                          <td colSpan="9">
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
