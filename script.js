(function () {
  "use strict";

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
  const MODEL_URL = "model/model.json";
  const MODEL_METADATA_URL = "model/metadata.json";

  const dropZone = document.querySelector("#dropZone");
  const photoInput = document.querySelector("#photoInput");
  const cameraInput = document.querySelector("#cameraInput");
  const choosePhotoButton = document.querySelector("#choosePhotoButton");
  const takePhotoButton = document.querySelector("#takePhotoButton");
  const uploadInstructions = document.querySelector("#uploadInstructions");
  const previewCard = document.querySelector("#previewCard");
  const imagePreview = document.querySelector("#imagePreview");
  const fileName = document.querySelector("#fileName");
  const removeImageButton = document.querySelector("#removeImageButton");
  const identifyButton = document.querySelector("#identifyButton");
  const validationMessage = document.querySelector("#validationMessage");
  const analysisPanel = document.querySelector("#analysisPanel");
  const resultsPanel = document.querySelector("#resultsPanel");

  const resultScientific = document.querySelector("#resultScientific");
  const resultName = document.querySelector("#resultName");
  const confidenceScore = document.querySelector("#confidenceScore");
  const statusPill = document.querySelector("#statusPill");
  const resultStatus = document.querySelector("#resultStatus");
  const resultHabitat = document.querySelector("#resultHabitat");
  const resultRegion = document.querySelector("#resultRegion");
  const resultConservation = document.querySelector("#resultConservation");
  const resultGuidance = document.querySelector("#resultGuidance");
  const alternativeList = document.querySelector("#alternativeList");

  // Bottom Navigation & Screens
  const navItems = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".tab-content");

  // Save Log Elements
  const saveOutcomeSelect = document.querySelector("#saveOutcomeSelect");
  const saveQtyInput = document.querySelector("#saveQtyInput");
  const saveCatchBtn = document.querySelector("#saveCatchBtn");
  const saveStatusMsg = document.querySelector("#saveStatusMsg");

  // Dashboard Screen UI Elements
  const dashboardDateFilter = document.querySelector("#dashboardDateFilter");
  const metricTotalFish = document.querySelector("#metricTotalFish");
  const metricSpecies = document.querySelector("#metricSpecies");
  const metricReleased = document.querySelector("#metricReleased");
  const metricProtected = document.querySelector("#metricProtected");

  const sparklineTotalPath = document.querySelector("#sparklineTotal");
  const sparklineSpeciesPath = document.querySelector("#sparklineSpecies");
  const sparklineReleasedPath = document.querySelector("#sparklineReleased");
  const sparklineProtectedPath = document.querySelector("#sparklineProtected");

  const speciesBarChart = document.querySelector("#speciesBarChart");
  const outcomeDonutChart = document.querySelector("#outcomeDonutChart");
  const outcomeLegend = document.querySelector("#outcomeLegend");
  const donutTotalCount = document.querySelector("#donutTotalCount");
  const latestSightingContainer = document.querySelector("#latestSightingContainer");
  const exportCsvBtn = document.querySelector("#exportCsvBtn");
  const clearAllRecordsBtn = document.querySelector("#clearAllRecordsBtn");

  // Language & PWA Status Elements
  const langBtn = document.querySelector("#langBtn");
  const langText = document.querySelector("#langText");
  const modelStatus = document.querySelector("#modelStatus");

  let selectedFile = null;
  let previewUrl = "";
  let analysisTimer = null;
  let imageLoaded = false;
  let model = null;
  let modelLabels = [];
  let modelReady = false;

  // Language Caches
  let currentLang = "en";
  let currentPredictionResult = null;

  const hasFishData =
    Array.isArray(window.FINSIGHT_FISH_DATA) && window.FINSIGHT_FISH_DATA.length > 0;

  /* ==========================================================================
     Translation Data and Dictionaries
     ========================================================================== */

  const uiTranslations = {
    en: {
      "header-desc": "AI-powered catch identification for UAE waters",
      "intro-eyebrow": "A region-first student innovation",
      "intro-title": "Identify your catch instantly and learn whether it should be kept, released, or reported.",
      "intro-copy": "Upload or take a clear photograph of a fish to identify its species and learn about its conservation status.",
      "guidance-1": "Keep the fish clearly visible.",
      "guidance-2": "Use good lighting.",
      "guidance-3": "Avoid blurry or distant images.",
      "upload-eyebrow": "Photo input",
      "upload-title": "Add a fish photo",
      "dropzone-title": "Drop a photo here",
      "dropzone-help": "JPG, JPEG, PNG, or WEBP files up to 10 MB.",
      "btn-choose": "Choose Photo",
      "btn-take": "Take Photo",
      "preview-eyebrow": "Selected image",
      "btn-remove": "Remove Image",
      "btn-identify": "Identify Fish",
      "scanner-eyebrow": "Image Classifier",
      "scanner-title": "Reviewing image features",
      "scanner-text": "Analyzing image features against local marine species database.",
      "results-eyebrow": "Identification result",
      "results-title": "Likely species",
      "results-match": "match",
      "label-habitat": "Habitat",
      "label-region": "Region & Rules",
      "label-conservation": "Conservation Status",
      "label-guidance": "Responsible Guidance",
      "alt-eyebrow": "Other possible matches",
      "alt-title": "Model alternatives",
      "no-image": "No image selected",
      "lang-label": "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©",
      "status-preparing": "Preparing offline model...",
      "status-ready": "Offline model ready",

      // Dashboard
      "dash-title": "Catch Dashboard",
      "dash-subtitle": "Overview of fish catch records from this device",
      "records-title": "Catch Records",
      "records-subtitle": "Full catch history stored on this device, filtered by the selected date range.",
      "opt-7days": "Last 7 Days",
      "opt-30days": "Last 30 Days",
      "opt-month": "This Month",
      "opt-all": "All Time",
      "card-total-title": "Total Fish Recorded",
      "card-species-title": "Species Identified",
      "card-released-title": "Fish Released",
      "card-protected-title": "Protected Species Detected",
      "chart-species": "Fish Recorded by Species",
      "chart-outcome": "Catch Outcome",
      "label-total-small": "Total",
      "sighting-header": "Protected Species Sightings",
      "btn-clear-all": "Clear All",
      "recent-catches-title": "Recent Catch Records",
      "btn-export": "Export Data (CSV)",
      "th-species": "Species",
      "th-date": "Date & Time",
      "th-location": "Location",
      "th-outcome": "Outcome",
      "th-qty": "Qty",
      "th-status": "Status",
      "th-confidence": "Confidence",
      "label-total": "Total",
      "label-released": "Released",
      "label-kept": "Kept",
      "no-protected-sightings": "No protected species sightings in this period.",
      "sighting-released-safely": "Released safely",
      "sighting-count-desc": "Sightings this month",

      // Save catch
      "save-catch-heading": "Log This Catch",
      "label-outcome": "Outcome:",
      "opt-released": "Released",
      "opt-kept": "Kept",
      "label-qty": "Qty:",
      "btn-save-log": "Save to Dashboard",
      "save-success": "Catch saved successfully!",
      "save-err-no-prediction": "Please run an identification before saving.",

      // Tab Nav
      "nav-identify": "Identify Fish",
      "nav-dashboard": "Dashboard",
      "nav-records": "Records",
      "nav-guide": "Guide",
      "nav-more": "More",

      // Placeholder tabs
      "guide-screen-title": "UAE Marine Protection Guide",
      "guide-screen-copy": "Explore regulations, sizes, seasonal restrictions, and conservation categories for local Arabian Gulf species.",
      "more-screen-title": "Settings & App Info",
      "more-screen-copy": "Manage your local data storage, review neural network model weights, and adjust offline configuration settings."
    },
    ar: {
      "header-desc": "Ø§Ù„ØªØ¹Ø±Ù Ø§Ù„Ø°ÙƒÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ ÙˆØ¥Ø±Ø´Ø§Ø¯Ø§Øª Ø§Ù„Ø­ÙØ¸ ÙÙŠ Ø§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ù…Ø­Ù„ÙŠØ©",
      "intro-eyebrow": "Ø§Ø¨ØªÙƒØ§Ø± Ø·Ù„Ø§Ø¨ÙŠ Ù‡Ùˆ Ø§Ù„Ø£ÙˆÙ„ Ù…Ù† Ù†ÙˆØ¹Ù‡ ÙÙŠ Ø§Ù„Ù…Ù†Ø·Ù‚Ø©",
      "intro-title": "ØªØ¹Ø±Ù Ø¹Ù„Ù‰ ØµÙŠØ¯Ùƒ ÙÙˆØ±Ø§Ù‹ ÙˆØ§Ø¹Ø±Ù Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† ÙŠØ¬Ø¨ Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ù‡ Ø£Ùˆ Ø¥Ø·Ù„Ø§Ù‚Ù‡ Ø£Ùˆ Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù†Ù‡.",
      "intro-copy": "Ù‚Ù… Ø¨ØªØ­Ù…ÙŠÙ„ Ø£Ùˆ Ø§Ù„ØªÙ‚Ø§Ø· ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ù„Ø³Ù…ÙƒØ© Ù„ØªØ­Ø¯ÙŠØ¯ ÙØµÙŠÙ„ØªÙ‡Ø§ ÙˆÙ…Ø¹Ø±ÙØ© Ø­Ø§Ù„Ø© Ø­ÙØ¸Ù‡Ø§ ÙˆØ§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…ØªØ¹Ù„Ù‚Ø© Ø¨Ù‡Ø§.",
      "guidance-1": "Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ ÙˆØ¶ÙˆØ­ Ø±Ø¤ÙŠØ© Ø§Ù„Ø³Ù…ÙƒØ©.",
      "guidance-2": "Ø§Ø³ØªØ®Ø¯Ù… Ø¥Ø¶Ø§Ø¡Ø© Ø¬ÙŠØ¯Ø© ÙˆÙƒØ§ÙÙŠØ©.",
      "guidance-3": "ØªØ¬Ù†Ø¨ Ø§Ù„ØµÙˆØ± Ø§Ù„Ø¨Ø§Ù‡ØªØ© Ø£Ùˆ Ø§Ù„Ø¨Ø¹ÙŠØ¯Ø©.",
      "upload-eyebrow": "Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„ØµÙˆØ±Ø©",
      "upload-title": "Ø£Ø¶Ù ØµÙˆØ±Ø© Ø³Ù…ÙƒØ©",
      "dropzone-title": "Ø£ÙÙ„Øª Ø§Ù„ØµÙˆØ±Ø© Ù‡Ù†Ø§",
      "dropzone-help": "Ù…Ù„ÙØ§Øª JPG Ø£Ùˆ JPEG Ø£Ùˆ PNG Ø£Ùˆ WEBP Ø­ØªÙ‰ 10 Ù…ÙŠØ¬Ø§Ø¨Ø§ÙŠØª.",
      "btn-choose": "Ø§Ø®ØªØ± ØµÙˆØ±Ø©",
      "btn-take": "Ø§Ù„ØªÙ‚Ø· ØµÙˆØ±Ø©",
      "preview-eyebrow": "Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©",
      "btn-remove": "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©",
      "btn-identify": "ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø³Ù…ÙƒØ©",
      "scanner-eyebrow": "Ù…ØµÙ†Ù Ø§Ù„ØµÙˆØ±",
      "scanner-title": "Ù…Ø±Ø§Ø¬Ø¹Ø© Ø®ØµØ§Ø¦Øµ Ø§Ù„ØµÙˆØ±Ø©",
      "scanner-text": "ØªØ­Ù„ÙŠÙ„ Ø®ØµØ§Ø¦Øµ Ø§Ù„ØµÙˆØ±Ø© Ø¨Ù…Ù‚Ø§Ø±Ù†ØªÙ‡Ø§ Ø¨Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙƒØ§Ø¦Ù†Ø§Øª Ø§Ù„Ø¨Ø­Ø±ÙŠØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ©.",
      "results-eyebrow": "Ù†ØªÙŠØ¬Ø© Ø§Ù„ØªØ¹Ø±Ù",
      "results-title": "Ø§Ù„ÙØµÙŠÙ„Ø© Ø§Ù„Ù…Ø±Ø¬Ø­Ø©",
      "results-match": "Ù…Ø·Ø§Ø¨Ù‚Ø©",
      "label-habitat": "Ø§Ù„Ù…ÙˆØ¦Ù„ Ø§Ù„Ø¨ÙŠØ¦ÙŠ",
      "label-region": "Ø§Ù„Ù…Ù†Ø·Ù‚Ø© ÙˆØ§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ†",
      "label-conservation": "Ø­Ø§Ù„Ø© Ø§Ù„Ø­ÙØ¸",
      "label-guidance": "Ø§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„Ø©",
      "alt-eyebrow": "Ù…Ø·Ø§Ø¨Ù‚Ø§Øª Ù…Ø­ØªÙ…Ù„Ø© Ø£Ø®Ø±Ù‰",
      "alt-title": "Ø¨Ø¯Ø§Ø¦Ù„ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬",
      "no-image": "Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø©",
      "lang-label": "English",
      "status-preparing": "Ø¬Ø§Ø±ÙŠ ØªØ­Ø¶ÙŠØ± Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ù„Ù„Ø¹Ù…Ù„ Ø¨Ø¯ÙˆÙ† Ø¥Ù†ØªØ±Ù†Øª...",
      "status-ready": "Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø¬Ø§Ù‡Ø² Ù„Ù„Ø¹Ù…Ù„ Ø¨Ø¯ÙˆÙ† Ø§ØªØµØ§Ù„",

      // Dashboard
      "dash-title": "Ù„ÙˆØ­Ø© ØµÙŠØ¯ÙŠ",
      "dash-subtitle": "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø³Ø¬Ù„Ø§Øª ØµÙŠØ¯ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ù…Ø³Ø¬Ù„Ø© Ù…Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²",
      "opt-7days": "Ø¢Ø®Ø± 7 Ø£ÙŠØ§Ù…",
      "opt-30days": "Ø¢Ø®Ø± 30 ÙŠÙˆÙ…Ø§Ù‹",
      "opt-month": "Ù‡Ø°Ø§ Ø§Ù„Ø´Ù‡Ø±",
      "opt-all": "ÙƒÙ„ Ø§Ù„Ø£ÙˆÙ‚Ø§Øª",
      "card-total-title": "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ù…Ø³Ø¬Ù„Ø©",
      "card-species-title": "Ø§Ù„ÙØµØ§Ø¦Ù„ Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©",
      "card-released-title": "Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ù…Ø·Ù„Ù‚Ø©",
      "card-protected-title": "Ø§Ù„Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø­Ù…ÙŠØ© Ø§Ù„Ù…ÙƒØªØ´ÙØ©",
      "chart-species": "Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø­Ø³Ø¨ Ø§Ù„ÙØµÙŠÙ„Ø©",
      "chart-outcome": "Ø­Ø§Ù„Ø© Ø§Ù„ØµÙŠØ¯",
      "label-total-small": "Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ",
      "sighting-header": "Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ø§Ù„Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø­Ù…ÙŠØ©",
      "btn-clear-all": "Ù…Ø³Ø­ Ø§Ù„Ø³Ø¬Ù„Ø§Øª",
      "recent-catches-title": "Ø³Ø¬Ù„Ø§Øª Ø§Ù„ØµÙŠØ¯ Ø§Ù„Ø£Ø®ÙŠØ±Ø©",
      "btn-export": "ØªØµØ¯ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (CSV)",
      "th-species": "Ø§Ù„ÙØµÙŠÙ„Ø©",
      "th-date": "Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„ÙˆÙ‚Øª",
      "th-location": "Ø§Ù„Ù…ÙˆÙ‚Ø¹",
      "th-outcome": "Ø§Ù„Ø­Ø§Ù„Ø©",
      "th-qty": "Ø§Ù„ÙƒÙ…ÙŠØ©",
      "th-status": "Ø­Ø§Ù„Ø© Ø§Ù„Ø­ÙØ¸",
      "th-confidence": "Ø§Ù„Ø¯Ù‚Ø©",
      "label-total": "Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ",
      "label-released": "Ù…Ø·Ù„Ù‚",
      "label-kept": "Ù…Ø­ØªÙØ¸ Ø¨Ù‡",
      "no-protected-sightings": "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ù„Ù„Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø­Ù…ÙŠØ© ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„ÙØªØ±Ø©.",
      "sighting-released-safely": "ØªÙ… Ø¥Ø·Ù„Ø§Ù‚Ù‡ Ø¨Ø£Ù…Ø§Ù†",
      "sighting-count-desc": "Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø´Ù‡Ø±",

      // Save catch
      "save-catch-heading": "ØªØ³Ø¬ÙŠÙ„ Ù‡Ø°Ø§ Ø§Ù„ØµÙŠØ¯",
      "label-outcome": "Ø§Ù„Ø­Ø§Ù„Ø©:",
      "opt-released": "Ù…Ø·Ù„Ù‚ (Released)",
      "opt-kept": "Ù…Ø­ØªÙØ¸ Ø¨Ù‡ (Kept)",
      "label-qty": "Ø§Ù„ÙƒÙ…ÙŠØ©:",
      "btn-save-log": "Ø­ÙØ¸ Ø¥Ù„Ù‰ Ù„ÙˆØ­Ø© ØµÙŠØ¯ÙŠ",
      "save-success": "ØªÙ… Ø­ÙØ¸ Ø§Ù„ØµÙŠØ¯ Ø¨Ù†Ø¬Ø§Ø­!",
      "save-err-no-prediction": "Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ù†ÙˆØ¹ Ø§Ù„Ø³Ù…ÙƒØ© Ø£ÙˆÙ„Ø§Ù‹ Ù‚Ø¨Ù„ Ø§Ù„Ø­ÙØ¸.",

      // Tab Nav
      "nav-identify": "Ø§Ù„ØªØ¹Ø±Ù Ø§Ù„Ø°ÙƒÙŠ",
      "nav-dashboard": "Ù„ÙˆØ­Ø© Ø§Ù„ØµÙŠØ¯",
      "nav-guide": "Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø­ÙØ¸",
      "nav-more": "Ø§Ù„Ù…Ø²ÙŠØ¯",

      // Placeholder tabs
      "guide-screen-title": "Ø¯Ù„ÙŠÙ„ Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„Ø¨Ø­Ø±ÙŠØ© Ù„Ù„Ø¥Ù…Ø§Ø±Ø§Øª",
      "guide-screen-copy": "Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† ÙˆØ§Ù„Ø£Ø­Ø¬Ø§Ù… ÙˆÙ…ÙˆØ§Ø³Ù… Ø­Ø¸Ø± Ø§Ù„ØµÙŠØ¯ ÙˆÙØ¦Ø§Øª Ø§Ù„Ø­ÙØ¸ Ù„Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ù…Ø­Ù„ÙŠØ© ÙÙŠ Ø§Ù„Ø®Ù„ÙŠØ¬ Ø§Ù„Ø¹Ø±Ø¨ÙŠ.",
      "more-screen-title": "Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ÙˆÙ…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªØ·Ø¨ÙŠÙ‚",
      "more-screen-copy": "Ø¥Ø¯Ø§Ø±Ø© ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø­Ù„ÙŠØ©ØŒ ÙˆØ§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø£ÙˆØ²Ø§Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø´Ø¨ÙƒØ© Ø§Ù„Ø¹ØµØ¨ÙŠØ© ÙˆØªÙƒÙˆÙŠÙ† Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø¨Ø¯ÙˆÙ† Ø§ØªØµØ§Ù„."
    }
  };

  const validations = {
    en: {
      "err-select": "Select a fish photo to continue.",
      "err-type": "Please choose a JPG, JPEG, PNG, or WEBP image.",
      "err-size": "This image is larger than 10 MB. Please choose a smaller file.",
      "err-identify": "Add a valid fish photo before identifying.",
      "err-load": "The selected image could not be loaded.",
      "err-model": "The fish identification model could not be loaded.",
      "err-classify": "The image could not be classified by the model."
    },
    ar: {
      "err-select": "Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø© Ø³Ù…ÙƒØ© Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©.",
      "err-type": "Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø© Ø¨ØµÙŠØºØ© JPG Ø£Ùˆ JPEG Ø£Ùˆ PNG Ø£Ùˆ WEBP.",
      "err-size": "Ø­Ø¬Ù… Ø§Ù„ØµÙˆØ±Ø© Ø£ÙƒØ¨Ø± Ù…Ù† 10 Ù…ÙŠØ¬Ø§Ø¨Ø§ÙŠØª. Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø§Ø®ØªÙŠØ§Ø± Ù…Ù„Ù Ø£ØµØºØ±.",
      "err-identify": "Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø¥Ø¶Ø§ÙØ© ØµÙˆØ±Ø© Ø³Ù…ÙƒØ© ØµØ§Ù„Ø­Ø© Ù‚Ø¨Ù„ Ø¨Ø¯Ø¡ Ø§Ù„ØªØ¹Ø±Ù.",
      "err-load": "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©.",
      "err-model": "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ.",
      "err-classify": "ØªØ¹Ø°Ø± ØªØµÙ†ÙŠÙ Ø§Ù„ØµÙˆØ±Ø© Ø¨ÙˆØ§Ø³Ø·Ø© Ø§Ù„Ù†Ù…ÙˆØ°Ø¬."
    }
  };

  const fishTranslations = {
    "green-sawfish": {
      commonName: "Ø³Ù…ÙƒØ© Ø§Ù„Ù…Ù†Ø´Ø§Ø± Ø§Ù„Ø®Ø¶Ø±Ø§Ø¡",
      scientificName: "Ø¨Ø±ÙŠØ³ØªÙŠØ³ Ø²ÙŠØ¬Ø³Ø±ÙˆÙ†",
      status: "Ù…Ù‡Ø¯Ø¯Ø© Ø¨Ø§Ù„Ø§Ù†Ù‚Ø±Ø§Ø¶ Ø¨Ø¯Ø±Ø¬Ø© Ù‚ØµÙˆÙ‰",
      statusSummary: "Ù†ÙˆØ¹ Ù…Ø­Ù…ÙŠ: ÙŠÙØ­Ø¸Ø± Ø§Ù„ØµÙŠØ¯ ÙÙŠ Ø¬Ù…ÙŠØ¹ Ø£Ù†ÙˆØ§Ø¹Ù‡ Ø¨Ø§Ù„Ø¯ÙˆÙ„Ø©. Ù„Ø§ ØªÙ†Ø´Ø± Ø§Ù„Ø´Ø¨ÙƒØ© ÙˆØ£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­Ù‡Ø§ ÙÙˆØ±Ø§Ù‹ Ø¥Ø°Ø§ ØªÙ… ØµÙŠØ¯Ù‡Ø§ Ø¨Ø§Ù„Ø®Ø·Ø£.",
      habitat: "Ø§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© Ø§Ù„Ø¶Ø­Ù„Ø© ÙˆØ§Ù„Ø¨Ø­ÙŠØ±Ø§Øª ÙˆÙ…ØµØ¨Ø§Øª Ø§Ù„Ø£Ù†Ù‡Ø§Ø± ÙˆÙ…Ù†Ø§Ø·Ù‚ Ø§Ù„Ù…Ø§Ù†ØºØ±ÙˆÙ.",
      region: "ÙŠÙØ­Ø¸Ø± ØµÙŠØ¯Ù‡Ø§ ÙÙŠ Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø¯ÙˆÙ„Ø© Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ù…ØªØ­Ø¯Ø©",
      conservationNote: "Ø­Ø±Ø¬Ø©",
      guidance: "Ù„Ø§ ØªØµØ·Ø§Ø¯ Ù‡Ø°Ø§ Ø§Ù„Ø­ÙŠÙˆØ§Ù† Ø£Ùˆ ØªØ­ØªÙØ¸ Ø¨Ù‡ Ø£Ùˆ ØªÙ†Ù‚Ù„Ù‡ Ø£Ùˆ ØªØ¨ÙŠØ¹Ù‡. Ø¥Ø°Ø§ ØªÙ… ØµÙŠØ¯Ù‡ Ø¨Ø§Ù„Ø®Ø·Ø£ØŒ Ø£Ø¨Ù‚Ù‡ ÙÙŠ Ø§Ù„Ù…Ø§Ø¡ØŒ ÙˆØªØ¬Ù†Ø¨ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù…Ù†Ø´Ø§Ø±ØŒ ÙˆØ§Ù‚Ø·Ø¹ Ø®ÙŠØ· Ø§Ù„ØµÙŠØ¯ Ø£Ùˆ Ø§Ù„Ø´Ø¨ÙƒØ© Ø¥Ø°Ø§ Ù„Ø²Ù… Ø§Ù„Ø£Ù…Ø±ØŒ ÙˆØ£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­Ù‡ Ø¹Ù„Ù‰ Ø§Ù„ÙÙˆØ±."
    },
    "halavi-guitarfish": {
      commonName: "Ø³Ù…ÙƒØ© Ø§Ù„Ø¬ÙŠØªØ§Ø± Ø§Ù„Ø­Ù„Ø§ÙˆÙŠ",
      scientificName: "Ø¬Ù„Ø§ÙˆÙƒÙˆØ³ØªÙŠØ¬ÙˆØ³ Ø­Ù„Ø§ÙˆÙŠ",
      status: "Ù…Ù‡Ø¯Ø¯Ø© Ø¨Ø§Ù„Ø§Ù†Ù‚Ø±Ø§Ø¶ Ø¨Ø¯Ø±Ø¬Ø© Ù‚ØµÙˆÙ‰",
      statusSummary: "Ø±Ø§ÙŠ Ù…Ø­Ù…ÙŠ: Ù„Ø§ ØªÙ†Ø´Ø± Ø§Ù„Ø´Ø¨ÙƒØ©. Ø£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­Ù‡ ÙÙˆØ±Ø§Ù‹ Ø¥Ø°Ø§ ØªÙ… ØµÙŠØ¯Ù‡ Ø¨Ø§Ù„Ø®Ø·Ø£.",
      habitat: "Ø§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© Ø§Ù„Ø¶Ø­Ù„Ø© ÙÙˆÙ‚ Ø§Ù„Ù‚ÙŠØ¹Ø§Ù† Ø§Ù„Ø±Ù…Ù„ÙŠØ© Ø£Ùˆ Ø§Ù„Ø·ÙŠÙ†ÙŠØ©.",
      region: "Ù„Ø§ ØªØµØ·Ø§Ø¯Ù‡Ø§ Ø£Ùˆ ØªØ­ØªÙØ¸ Ø¨Ù‡Ø§",
      conservationNote: "Ø­Ø±Ø¬Ø©",
      guidance: "Ù„Ø§ ØªØ­ØªÙØ¸ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø­ÙŠÙˆØ§Ù†. ÙÙŠ Ø£Ø¨ÙˆØ¸Ø¨ÙŠØŒ ÙŠÙØ­Ø¸Ø± ØµÙŠØ¯ Ø£Ùˆ Ø¨ÙŠØ¹ Ø£Ùˆ Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§Ù„Ø±Ø§ÙŠ Ø¨Ø¬Ù…ÙŠØ¹ Ø£Ù†ÙˆØ§Ø¹Ù‡. Ø¥Ø°Ø§ ØªÙ… ØµÙŠØ¯Ù‡ Ø¨Ø§Ù„Ø®Ø·Ø£ØŒ Ø§ØªØ±ÙƒÙ‡ ÙÙŠ Ø§Ù„Ù…Ø§Ø¡ ÙˆØ£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­Ù‡ ÙÙˆØ±Ø§Ù‹."
    },
    "hammour": {
      commonName: "Ù‡Ø§Ù…ÙˆØ±",
      scientificName: "Ø¥ÙŠØ¨ÙŠÙ†ÙŠÙÙŠÙ„ÙˆØ³ ÙƒÙˆÙŠÙˆÙŠØ¯ÙŠØ³",
      status: "ØºÙŠØ± Ù…Ù‡Ø¯Ø¯",
      statusSummary: "ØµÙŠØ¯ Ù…Ø­Ø¯ÙˆØ¯: Ø­Ø¯ Ø£Ù‚ØµÙ‰ 2 Ù„ÙƒÙ„ Ø´Ø®Øµ ÙŠÙˆÙ…ÙŠØ§Ù‹ Ùˆ8 Ù„ÙƒÙ„ Ù‚Ø§Ø±Ø¨ ÙŠÙˆÙ…ÙŠØ§Ù‹ ÙÙŠ Ø£Ø¨ÙˆØ¸Ø¨ÙŠ.",
      habitat: "Ø§Ù„Ø´Ø¹Ø§Ø¨ Ø§Ù„Ù…Ø±Ø¬Ø§Ù†ÙŠØ©ØŒ Ø§Ù„Ù‚ÙŠØ¹Ø§Ù† Ø§Ù„ØµØ®Ø±ÙŠØ©ØŒ Ø§Ù„Ù…Ø§Ù†ØºØ±ÙˆÙØŒ Ù…ØµØ¨Ø§Øª Ø§Ù„Ø£Ù†Ù‡Ø§Ø± ÙˆØ§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© Ø§Ù„Ø¶Ø­Ù„Ø©.",
      region: "Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 2 Ù„ÙƒÙ„ Ø´Ø®Øµ ÙŠÙˆÙ…ÙŠØ§Ù‹ ÙÙŠ Ø£Ø¨ÙˆØ¸Ø¨ÙŠ",
      conservationNote: "Ù…ØªÙˆØ³Ø·",
      guidance: "ÙÙŠ Ø£Ø¨ÙˆØ¸Ø¨ÙŠØŒ ÙŠØ¬ÙˆØ² Ù„Ù„ØµÙŠØ§Ø¯ Ø§Ù„Ù‡Ø§ÙˆÙŠ Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ Ø¨Ø³Ù…ÙƒØªÙŠÙ† Ù‡Ø§Ù…ÙˆØ± Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠØ© Ø§Ù„Ù†Ù‚Ø· ÙŠÙˆÙ…ÙŠØ§Ù‹ØŒ ÙˆØ¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ 8 Ø³Ù…ÙƒØ§Øª Ù„ÙƒÙ„ Ù‚Ø§Ø±Ø¨ ÙŠÙˆÙ…ÙŠØ§Ù‹. Ø£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ© ÙˆØ£ÙŠ Ø£Ø³Ù…Ø§Ùƒ ØµØºÙŠØ±Ø©."
    },
    "sultan-ibrahim": {
      commonName: "Ø³Ù„Ø·Ø§Ù† Ø¥Ø¨Ø±Ø§Ù‡ÙŠÙ…",
      scientificName: "Ù†ÙŠÙ…ÙŠØ¨ØªÙŠØ±ÙˆØ³ Ø¬Ø§Ø¨ÙˆÙ†ÙŠÙƒÙˆØ³",
      status: "ØºÙŠØ± Ù…Ù‡Ø¯Ø¯",
      statusSummary: "Ù…Ø³Ù…ÙˆØ­ Ø¨Ø§Ù„ØµÙŠØ¯: Ø§Ø­ØªÙØ¸ ÙÙ‚Ø· Ø¨Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ø¨Ø§Ù„ØºØ© Ø§Ù„ØªÙŠ ØªÙ… ØµÙŠØ¯Ù‡Ø§ Ø¨Ø´ÙƒÙ„ Ù‚Ø§Ù†ÙˆÙ†ÙŠ ÙˆØªØ¬Ù†Ø¨ Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„ØµÙŠØ¯ Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©.",
      habitat: "Ø§Ù„Ù‚ÙŠØ¹Ø§Ù† Ø§Ù„Ø±Ù…Ù„ÙŠØ© ÙˆØ§Ù„Ø·ÙŠÙ†ÙŠØ© ÙÙŠ Ø§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ù‚Ù„ÙŠÙ…ÙŠØ©.",
      region: "ÙŠÙØ³Ù…Ø­ Ø¨Ø§Ù„ØµÙŠØ¯ Ø¨ØªØ±Ø®ÙŠØµ Ø³Ø§Ø±ÙŠ Ø§Ù„Ù…ÙØ¹ÙˆÙ„",
      conservationNote: "Ù…Ù†Ø®ÙØ¶",
      guidance: "ÙŠÙ…ÙƒÙ† Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§Ù„Ø³Ù…ÙƒØ© Ø¹Ù†Ø¯ ØµÙŠØ¯Ù‡Ø§ Ø¨Ø´ÙƒÙ„ Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù…Ø¹ Ø±Ø®ØµØ© ØµÙŠØ¯ ØªØ±ÙÙŠÙ‡ÙŠØ© Ø³Ø§Ø±ÙŠØ© Ø§Ù„Ù…ÙØ¹ÙˆÙ„. Ù„Ø§ ØªØµØ·Ø¯ ÙÙŠ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„Ù…Ø­Ù…ÙŠØ©ØŒ Ø£Ùˆ Ø§Ù„Ù‚Ù†ÙˆØ§Øª Ø§Ù„Ù…Ù„Ø§Ø­ÙŠØ©. Ø£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„ØµØºÙŠØ±Ø©."
    },
    "kingfish": {
      commonName: "ÙƒÙ†Ø¹Ø¯ (Ø³Ù…Ùƒ Ø§Ù„Ù…Ù„Ùƒ)",
      scientificName: "Ø³ÙƒÙˆÙ…Ø¨ÙŠØ±ÙˆÙ…ÙˆØ±ÙˆØ³ ÙƒÙˆÙ…Ø±Ø³ÙˆÙ†",
      status: "Ù‚Ø±ÙŠØ¨ Ù…Ù† Ø§Ù„ØªÙ‡Ø¯ÙŠØ¯",
      statusSummary: "Ù‚Ø§Ø¹Ø¯Ø© Ù…ÙˆØ³Ù…ÙŠØ©: ÙŠÙØ­Ø¸Ø± Ø§Ù„ØµÙŠØ¯ Ù…Ù† 15 Ø£ØºØ³Ø·Ø³ Ø¥Ù„Ù‰ 15 Ø£ÙƒØªÙˆØ¨Ø±. Ø­Ø¯ Ø£Ø¨ÙˆØ¸Ø¨ÙŠ: 3 Ù„ÙƒÙ„ Ø´Ø®Øµ Ùˆ12 Ù„ÙƒÙ„ Ù‚Ø§Ø±Ø¨ ÙŠÙˆÙ…ÙŠØ§Ù‹.",
      habitat: "Ø§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ù‚Ù„ÙŠÙ…ÙŠØ© Ø§Ù„Ù…ÙØªÙˆØ­Ø©ØŒ ØºØ§Ù„Ø¨Ø§Ù‹ Ø¨Ø§Ù„Ù‚Ø±Ø¨ Ù…Ù† Ø§Ù„Ø´Ø¹Ø§Ø¨ Ø§Ù„Ù…Ø±Ø¬Ø§Ù†ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„ØªÙŠ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø£Ø³Ø±Ø§Ø¨ Ù…Ù† Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„ØµØºÙŠØ±Ø©.",
      region: "Ù…ÙˆØ³Ù… Ø§Ù„Ø­Ø¸Ø±: Ù…Ù† 15 Ø£ØºØ³Ø·Ø³ Ø¥Ù„Ù‰ 15 Ø£ÙƒØªÙˆØ¨Ø±",
      conservationNote: "Ù…ØªÙˆØ³Ø·",
      guidance: "Ù„Ø§ ØªØµØ·Ø¯ Ø§Ù„ÙƒÙ†Ø¹Ø¯ Ù…Ù† 15 Ø£ØºØ³Ø·Ø³ Ø¥Ù„Ù‰ 15 Ø£ÙƒØªÙˆØ¨Ø±. Ø®Ø§Ø±Ø¬ Ù…ÙˆØ³Ù… Ø§Ù„Ø­Ø¸Ø±ØŒ ÙŠØ¬ÙˆØ² Ù„ØµÙŠØ§Ø¯ÙŠ Ø£Ø¨ÙˆØ¸Ø¨ÙŠ Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø­Ø¯ Ø£Ù‚ØµÙ‰ Ø¨Ù€ 3 Ø³Ù…ÙƒØ§Øª ÙƒÙ†Ø¹Ø¯ Ù„ÙƒÙ„ Ø´Ø®Øµ ÙŠÙˆÙ…ÙŠØ§Ù‹. Ø£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­ Ø§Ù„Ø³Ù…ÙƒØ© Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ù…ÙˆØ³Ù… Ù…ØºÙ„Ù‚Ø§Ù‹."
    },
    "black-pomfret": {
      commonName: "Ø­Ù„ÙˆØ§ÙŠ Ø£Ø³ÙˆØ¯ (Ø²Ø¨ÙŠØ¯ÙŠ Ø£Ø³ÙˆØ¯)",
      scientificName: "Ø¨Ø§Ø±Ø§Ø³ØªØ±ÙˆÙ…Ø§ØªÙŠÙˆØ³ Ù†ÙŠØ¬Ø±",
      status: "ØºÙŠØ± Ù…Ù‡Ø¯Ø¯",
      statusSummary: "Ù…Ø³Ù…ÙˆØ­ Ø¨Ø§Ù„ØµÙŠØ¯: Ø§Ø­ØªÙØ¸ ÙÙ‚Ø· Ø¨Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„Ø¨Ø§Ù„ØºØ© Ø§Ù„ØªÙŠ ØªÙ… ØµÙŠØ¯Ù‡Ø§ Ø¨Ø´ÙƒÙ„ Ù‚Ø§Ù†ÙˆÙ†ÙŠ ÙˆØªØ¬Ù†Ø¨ Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„ØµÙŠØ¯ Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©.",
      habitat: "Ø§Ù„Ù…ÙŠØ§Ù‡ Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© ÙˆØ§Ù„Ø¥Ù‚Ù„ÙŠÙ…ÙŠØ©ØŒ Ø®Ø§ØµØ© ÙÙˆÙ‚ Ø§Ù„Ù‚ÙŠØ¹Ø§Ù† Ø§Ù„Ø±Ù…Ù„ÙŠØ© Ø£Ùˆ Ø§Ù„Ø·ÙŠÙ†ÙŠØ©.",
      region: "ÙŠÙØ³Ù…Ø­ Ø¨Ø§Ù„ØµÙŠØ¯ Ø¨ØªØ±Ø®ÙŠØµ Ø³Ø§Ø±ÙŠ Ø§Ù„Ù…ÙØ¹ÙˆÙ„",
      conservationNote: "Ù…Ù†Ø®ÙØ¶",
      guidance: "ÙŠÙ…ÙƒÙ† Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§Ù„Ø³Ù…ÙƒØ© Ø¹Ù†Ø¯ ØµÙŠØ¯Ù‡Ø§ Ø¨Ø´ÙƒÙ„ Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù…Ø¹ Ø±Ø®ØµØ© ØµÙŠØ¯ ØªØ±ÙÙŠÙ‡ÙŠØ© Ø³Ø§Ø±ÙŠØ© Ø§Ù„Ù…ÙØ¹ÙˆÙ„. Ù„Ø§ ØªØµØ·Ø¯ ÙÙŠ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„Ù…Ø­Ù…ÙŠØ©. Ø£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­ Ø§Ù„Ø£Ø³Ù…Ø§Ùƒ Ø§Ù„ØµØºÙŠØ±Ø©."
    },
    "unknown": {
      commonName: "Ø³Ù…ÙƒØ© ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙØ©",
      scientificName: "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
      status: "ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ",
      statusSummary: "ØªØ­Ø¯ÙŠØ¯ ØºÙŠØ± Ù…Ø¤ÙƒØ¯: Ù„Ø§ ØªÙØªØ±Ø¶ Ø£Ù† Ù‡Ø°Ù‡ Ø§Ù„Ø³Ù…ÙƒØ© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ù„Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ù‡Ø§.",
      habitat: "Ù„Ø§ ÙŠÙ…ÙƒÙ† ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ø¹Ø¯Ù… ÙˆØ¶ÙˆØ­ ÙØµÙŠÙ„Ø© Ø§Ù„Ø³Ù…ÙƒØ©.",
      region: "Ù„Ø§ ØªØ­ØªÙØ¸ Ø¨Ù‡Ø§ Ø­ØªÙ‰ ÙŠØªÙ… ØªØ­Ø¯ÙŠØ¯ ÙØµÙŠÙ„ØªÙ‡Ø§",
      conservationNote: "ØºÙŠØ± Ù…Ø¤ÙƒØ¯",
      guidance: "Ù„Ø§ ØªØ­ØªÙØ¸ Ø¨Ø§Ù„Ø³Ù…ÙƒØ© Ø·Ø§Ù„Ù…Ø§ Ø£Ù† Ù‡ÙˆÙŠØªÙ‡Ø§ ØºÙŠØ± Ù…Ø¤ÙƒØ¯Ø©. Ø§Ù„ØªÙ‚Ø· ØµÙˆØ±Ø© Ø¬Ø§Ù†Ø¨ÙŠØ© ÙˆØ§Ø¶Ø­Ø© Ø£Ø®Ø±Ù‰. Ø¥Ø°Ø§ ØªÙ… ØµÙŠØ¯Ù‡Ø§ Ø¨Ø§Ù„ÙØ¹Ù„ØŒ Ø£Ø·Ù„Ù‚ Ø³Ø±Ø§Ø­Ù‡Ø§ Ø¨Ø¹Ù†Ø§ÙŠØ©."
    }
  };

  /* ==========================================================================
     Language Translation Engine
     ========================================================================== */

  function translateFish(fish, lang) {
    if (lang === "en" || !fish) return fish;

    const trans = fishTranslations[fish.id] || {};
    return {
      ...fish,
      commonName: trans.commonName || fish.commonName,
      scientificName: trans.scientificName || fish.scientificName,
      status: trans.status || fish.status,
      statusSummary: trans.statusSummary || fish.statusSummary,
      habitat: trans.habitat || fish.habitat,
      region: trans.region || fish.region,
      conservationNote: trans.conservationNote || fish.conservationNote,
      guidance: trans.guidance || fish.guidance
    };
  }

  function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    // Translate all static nodes tagged with data-translate
    document.querySelectorAll("[data-translate]").forEach((el) => {
      const key = el.getAttribute("data-translate");
      if (uiTranslations[lang][key]) {
        el.textContent = uiTranslations[lang][key];
      }
    });

    // Update language button text
    langText.textContent = uiTranslations[lang]["lang-label"];

    // Update image input filename text if empty
    if (!selectedFile) {
      fileName.textContent = uiTranslations[lang]["no-image"];
    }

    // Refresh prediction results display if visible
    if (currentPredictionResult) {
      renderResult(currentPredictionResult);
    }

    // Refresh Dashboard to reflect language selection on charts and listings
    renderDashboard();
  }

  function setModelOfflineReady() {
    if (modelStatus) {
      modelStatus.setAttribute("data-translate", "status-ready");
      modelStatus.classList.add("ready");
      modelStatus.textContent = uiTranslations[currentLang]["status-ready"];
    }
  }

  /* ==========================================================================
     Persistent Catch Records Storage (localStorage)
     ========================================================================== */

  const LOCAL_STORAGE_KEY = "marine_lens_catches";
  const STORAGE_DEBUG_PREFIX = "[Marine Lens][Storage]";
  const RECORDS_DEBUG_PREFIX = "[Marine Lens][Records]";
  let storageUnavailableReason = "";

  function logStorageDebug(message, details) {
    if (typeof details === "undefined") {
      console.debug(STORAGE_DEBUG_PREFIX, message);
      return;
    }
    console.debug(STORAGE_DEBUG_PREFIX, message, details);
  }

  function safeStorageGet(key) {
    try {
      storageUnavailableReason = "";
      return localStorage.getItem(key);
    } catch (error) {
      storageUnavailableReason = `${error.name || "StorageError"}: ${error.message || "Unable to read localStorage."}`;
      console.error(`${STORAGE_DEBUG_PREFIX} Failed to read key "${key}".`, error);
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      storageUnavailableReason = "";
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      storageUnavailableReason = `${error.name || "StorageError"}: ${error.message || "Unable to write localStorage."}`;
      console.error(`${STORAGE_DEBUG_PREFIX} Failed to write key "${key}".`, error);
      return false;
    }
  }

  function isValidCatchRecord(record) {
    if (!record || typeof record !== "object") return false;
    if (typeof record.species !== "string" || !record.species.trim()) return false;
    if (typeof record.outcome !== "string" || !record.outcome.trim()) return false;
    if (!Number.isFinite(Number(record.quantity)) || Number(record.quantity) < 1) return false;
    if (!Number.isFinite(new Date(record.dateTime).getTime())) return false;
    return true;
  }

  function buildRecordsHint(reasonKey, invalidCount) {
    if (currentLang === "ar") {
      if (reasonKey === "storage-unavailable") {
        return "تعذر الوصول إلى التخزين المحلي. راجع وحدة التحكم للمزيد من التفاصيل.";
      }
      if (reasonKey === "invalid-records") {
        return `تم تخطي ${invalidCount} سجل غير صالح. راجع وحدة التحكم للمزيد من التفاصيل.`;
      }
      if (reasonKey === "render-failed") {
        return "حدث خطأ أثناء عرض السجلات. راجع وحدة التحكم للمزيد من التفاصيل.";
      }
      return "لا توجد سجلات تطابق عامل التصفية الحالي.";
    }

    if (reasonKey === "storage-unavailable") {
      return "Local storage is unavailable in this browser context. Check the console for details.";
    }
    if (reasonKey === "invalid-records") {
      return `${invalidCount} invalid record${invalidCount === 1 ? "" : "s"} skipped. Check the console for details.`;
    }
    if (reasonKey === "render-failed") {
      return "A row render failed. Check the console for details.";
    }
    return "No records match the current filter.";
  }

  function renderRecordsEmptyState(reasonKey, invalidCount) {
    if (!recentCatchList) return;

    const title = currentLang === "ar" ? "لا توجد سجلات صيد معروضة" : "No catches recorded";
    const hint = buildRecordsHint(reasonKey, invalidCount || 0);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="7" style="text-align:center; color:var(--text-muted); font-style:italic;">
        <div>${title}</div>
        <div style="margin-top:6px; font-size:0.85rem;">${hint}</div>
      </td>
    `;
    recentCatchList.append(row);
  }

  function getCatchRecords() {
    const raw = safeStorageGet(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const records = Array.isArray(parsed) ? parsed : [];
        logStorageDebug("Loaded records from localStorage.", {
          totalStoredRecords: records.length,
          firstRecord: records[0] || null
        });
        return records;
      } catch (e) {
        console.error(`${STORAGE_DEBUG_PREFIX} Failed to parse local catch records, seeding clean list.`, e);
      }
    }
    return seedSampleCatchRecords();
  }

  function saveCatchRecord(record) {
    const records = getCatchRecords();
    records.unshift(record);
    logStorageDebug("Saving catch record.", {
      totalStoredRecords: records.length,
      firstRecord: records[0] || null
    });
    safeStorageSet(LOCAL_STORAGE_KEY, JSON.stringify(records));
  }

  function seedSampleCatchRecords() {
    const records = [];
    const now = new Date();
    
    // Sample species options
    const speciesList = [
      { id: "kingfish", name: "Kingfish", sci: "Scomberomorus commerson", status: "Near Threatened", isProtected: false },
      { id: "hammour", name: "Hammour", sci: "Epinephelus coioides", status: "Safe", isProtected: false },
      { id: "green-sawfish", name: "Green Sawfish", sci: "Pristis zijsron", status: "Critically Endangered", isProtected: true },
      { id: "trevally", name: "Trevally", sci: "Carangoides bajad", status: "Safe", isProtected: false },
      { id: "black-pomfret", name: "Black Pomfret", sci: "Parastromateus niger", status: "Safe", isProtected: false }
    ];

    const locations = [
      { name: "Dubai", lat: 25.2048, lng: 55.2708 },
      { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
      { name: "Sharjah", lat: 25.3463, lng: 55.4209 }
    ];

    // Seed exactly ~38 fish (distributed among ~22 individual catches)
    const speciesTargets = [
      { idx: 0, qty: 14 }, // Kingfish (14 total)
      { idx: 1, qty: 8 },  // Hammour (8 total)
      { idx: 2, qty: 3 },  // Green Sawfish (3 total, protected)
      { idx: 3, qty: 5 },  // Trevally (5 total)
      { idx: 4, qty: 8 }   // Black Pomfret (8 total)
    ];

    speciesTargets.forEach((target) => {
      const sp = speciesList[target.idx];
      let remainingQty = target.qty;

      while (remainingQty > 0) {
        const qty = sp.isProtected ? 1 : Math.min(remainingQty, Math.floor(Math.random() * 2) + 1);
        remainingQty -= qty;

        // Distribute dates over last 14 days
        const daysAgo = Math.floor(Math.random() * 14);
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const confidence = Math.floor(Math.random() * 12) + 85; // 85% to 97%

        // Protected species are always released
        const outcome = sp.isProtected ? "Released" : (Math.random() > 0.38 ? "Kept" : "Released");

        records.push({
          id: sp.id,
          species: sp.name,
          scientificName: sp.sci,
          confidence: confidence,
          outcome: outcome,
          conservationStatus: sp.status,
          quantity: qty,
          dateTime: date.toISOString(),
          latitude: loc.lat,
          longitude: loc.lng,
          locationName: loc.name
        });
      }
    });

    // Sort descending by date
    records.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    logStorageDebug("Seeding sample catch records.", {
      totalStoredRecords: records.length,
      firstRecord: records[0] || null
    });
    safeStorageSet(LOCAL_STORAGE_KEY, JSON.stringify(records));
    return records;
  }

  /* ==========================================================================
     Catch Dashboard Logic
     ========================================================================== */

  function filterRecordsByDate(records, rangeType) {
    const now = new Date();
    let minTime = 0;

    if (rangeType === "7days") {
      minTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (rangeType === "30days") {
      minTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (rangeType === "thismonth") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      minTime = startOfMonth.getTime();
    } else {
      // All time
      return records;
    }

    return records.filter((r) => {
      const logTime = new Date(r.dateTime).getTime();
      if (!Number.isFinite(logTime)) {
        console.warn(`${RECORDS_DEBUG_PREFIX} Skipping record with invalid date during filtering.`, r);
        return false;
      }
      return logTime >= minTime;
    });
  }

  function calculateDashboardStats(filteredRecords) {
    let totalFish = 0;
    let releasedCount = 0;
    let protectedCount = 0;
    const uniqueSpecies = new Set();

    filteredRecords.forEach((r) => {
      totalFish += r.quantity;
      uniqueSpecies.add(r.species);

      if (r.outcome === "Released") {
        releasedCount += r.quantity;
      }

      // Check if species is protected (Green Sawfish or Halavi Guitarfish)
      const lowerSpecies = r.species.toLowerCase();
      if (lowerSpecies.includes("sawfish") || lowerSpecies.includes("guitarfish")) {
        protectedCount += r.quantity;
      }
    });

    return {
      totalFish,
      speciesCount: uniqueSpecies.size,
      releasedCount,
      protectedCount
    };
  }

  function getSparklinePoints(records, metricType, pointsCount = 10) {
    // Generate simple time-series counts for sparklines
    const points = Array(pointsCount).fill(0);
    if (records.length === 0) return points;

    // Distribute records into time buckets
    const now = new Date().getTime();
    let minTime = now - 14 * 24 * 60 * 60 * 1000; // 14 days spread

    // Find min date in records to scale buckets
    records.forEach((r) => {
      const t = new Date(r.dateTime).getTime();
      if (t < minTime) minTime = t;
    });

    const span = now - minTime || 1;

    records.forEach((r) => {
      const t = new Date(r.dateTime).getTime();
      const bucketIdx = Math.min(
        pointsCount - 1,
        Math.floor(((t - minTime) / span) * pointsCount)
      );

      if (metricType === "total") {
        points[bucketIdx] += r.quantity;
      } else if (metricType === "released" && r.outcome === "Released") {
        points[bucketIdx] += r.quantity;
      } else if (metricType === "protected") {
        const lower = r.species.toLowerCase();
        if (lower.includes("sawfish") || lower.includes("guitarfish")) {
          points[bucketIdx] += r.quantity;
        }
      } else if (metricType === "species") {
        // Unique species in this bucket
        points[bucketIdx] += 1;
      }
    });

    return points;
  }

  function renderSparkline(pathElement, points) {
    if (!pathElement) return;
    const maxVal = Math.max(...points, 1);
    const width = 100;
    const height = 24;
    const xStep = width / (points.length - 1 || 1);

    let pathD = `M 0 ${height}`;
    points.forEach((val, idx) => {
      const x = idx * xStep;
      // Invert Y coordinate so 0 is at bottom
      const y = height - (val / maxVal) * (height - 4);
      
      if (idx === 0) {
        pathD = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });

    pathElement.setAttribute("d", pathD);
  }

  function renderDashboard() {
    const rawRecords = getCatchRecords();
    const filterVal = dashboardDateFilter.value;
    const filtered = filterRecordsByDate(rawRecords, filterVal);
    const stats = calculateDashboardStats(filtered);

    // Update dynamic stat cards
    metricTotalFish.textContent = stats.totalFish;
    metricSpecies.textContent = stats.speciesCount;
    metricReleased.textContent = stats.releasedCount;
    metricProtected.textContent = stats.protectedCount;

    // Render sparklines
    renderSparkline(sparklineTotalPath, getSparklinePoints(filtered, "total"));
    renderSparkline(sparklineSpeciesPath, getSparklinePoints(filtered, "species"));
    renderSparkline(sparklineReleasedPath, getSparklinePoints(filtered, "released"));
    renderSparkline(sparklineProtectedPath, getSparklinePoints(filtered, "protected"));

    // Render Charts
    renderCharts(filtered);

    // Render Latest Protected sighting
    renderLatestProtectedSighting(filtered);

  }
  function escapeCsvCell(value) {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  function buildRecordsCsv(records) {
    const headers = [
      "Species",
      "Scientific Name",
      "Confidence",
      "Outcome",
      "Conservation Status",
      "Quantity",
      "Date",
      "Location",
      "Latitude",
      "Longitude"
    ];

    const rows = records
      .filter((record) => isValidCatchRecord(record))
      .map((r) => [
        escapeCsvCell(r.species),
        escapeCsvCell(r.scientificName),
        escapeCsvCell(`${r.confidence}%`),
        escapeCsvCell(r.outcome),
        escapeCsvCell(r.conservationStatus),
        r.quantity,
        escapeCsvCell(r.dateTime),
        escapeCsvCell(r.locationName),
        r.latitude,
        r.longitude
      ].join(","));

    return [headers.join(","), ...rows].join("\n");
  }

  function renderCharts(records) {
    if (!speciesBarChart || !outcomeDonutChart || !outcomeLegend) {
      return;
    }

    const speciesCounts = {};
    records.forEach((r) => {
      const name = currentLang === "ar"
        ? translateFish({ id: r.id, commonName: r.species }, "ar").commonName
        : r.species;
      speciesCounts[name] = (speciesCounts[name] || 0) + r.quantity;
    });

    const sortedSpecies = Object.entries(speciesCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedSpecies.length === 0) {
      speciesBarChart.innerHTML = `
        <div class="chart-empty-state">
          ${currentLang === "ar" ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ø¹Ø±Ø¶Ù‡Ø§" : "No data to visualize yet."}
        </div>
      `;
    } else {
      const maxValue = Math.max(...sortedSpecies.map((entry) => entry[1]), 1);
      speciesBarChart.innerHTML = sortedSpecies
        .map(([label, value]) => {
          const width = Math.max(12, Math.round((value / maxValue) * 100));
          return `
            <div class="bar-row">
              <div class="bar-row-meta">
                <span class="bar-label">${label}</span>
                <strong class="bar-value">${value}</strong>
              </div>
              <div class="bar-track">
                <span class="bar-fill" style="width:${width}%"></span>
              </div>
            </div>
          `;
        })
        .join("");
    }

    let releasedQty = 0;
    let keptQty = 0;

    records.forEach((r) => {
      if (r.outcome === "Released") {
        releasedQty += r.quantity;
      } else {
        keptQty += r.quantity;
      }
    });

    const totalQty = releasedQty + keptQty;
    const releasedLabel = currentLang === "ar" ? "Ù…Ø·Ù„Ù‚" : "Released";
    const keptLabel = currentLang === "ar" ? "Ù…Ø­ØªÙØ¸ Ø¨Ù‡" : "Kept";
    const releasedPercent = totalQty === 0 ? 0 : Math.round((releasedQty / totalQty) * 100);
    const keptPercent = totalQty === 0 ? 0 : 100 - releasedPercent;

    donutTotalCount.textContent = totalQty;
    outcomeDonutChart.style.background = totalQty === 0
      ? "conic-gradient(rgba(255,255,255,0.08) 0 100%)"
      : `conic-gradient(#10b981 0 ${releasedPercent}%, #0ea5e9 ${releasedPercent}% 100%)`;

    outcomeLegend.innerHTML = `
      <div class="outcome-legend-item">
        <span class="legend-dot released-dot"></span>
        <span>${releasedLabel}</span>
        <strong>${releasedQty}</strong>
      </div>
      <div class="outcome-legend-item">
        <span class="legend-dot kept-dot"></span>
        <span>${keptLabel}</span>
        <strong>${keptQty}</strong>
      </div>
      <div class="outcome-legend-item">
        <span class="legend-dot neutral-dot"></span>
        <span>${currentLang === "ar" ? "Ù†Ø³Ø¨Ø©" : "Split"}</span>
        <strong>${releasedPercent}% / ${keptPercent}%</strong>
      </div>
    `;
  }

  function renderLatestProtectedSighting(records) {
    if (!latestSightingContainer) return;
    latestSightingContainer.innerHTML = "";

    // Filter to protected sightings only
    const protectedRecords = records.filter((r) => {
      const lower = r.species.toLowerCase();
      return lower.includes("sawfish") || lower.includes("guitarfish");
    });

    if (protectedRecords.length === 0) {
      latestSightingContainer.innerHTML = `
        <p class="no-sightings-msg" data-translate="no-protected-sightings">
          ${uiTranslations[currentLang]["no-protected-sightings"]}
        </p>
      `;
      return;
    }

    // Get the latest single sighting
    const latest = protectedRecords[0];
    
    // Count matches for this specific species in current filtered range
    const sightingsCount = protectedRecords.filter(r => r.species === latest.species)
      .reduce((sum, r) => sum + r.quantity, 0);

    const transName = translateFish({ id: latest.id, commonName: latest.species, scientificName: latest.scientificName }, currentLang);

    // Handcrafted sawfish SVG silhouette path
    const sawfishPath = `
      <svg viewBox="0 0 100 40" fill="#EF4444" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20 C15 15, 25 12, 35 15 L32 12 L35 12 L33 15 C45 16, 55 12, 65 17 L62 13 L65 13 L63 17 C75 19, 82 17, 95 20 C85 24, 75 22, 63 23 L65 27 L62 27 L65 23 C55 25, 45 23, 33 24 L35 27 L32 27 L35 24 C25 25, 15 22, 5 20 Z" />
        <path d="M 5 20 L 5 15 L 3 15 L 3 20" stroke="#EF4444" stroke-width="0.8" />
        <path d="M 12 20 L 12 14 L 10 14 L 10 20" stroke="#EF4444" stroke-width="0.8" />
        <path d="M 18 20 L 18 13 L 16 13 L 16 20" stroke="#EF4444" stroke-width="0.8" />
        <path d="M 24 20 L 24 13 L 22 13 L 22 20" stroke="#EF4444" stroke-width="0.8" />
      </svg>
    `;

    const badge = document.createElement("div");
    badge.className = "sighting-badge";

    badge.innerHTML = `
      <div class="sighting-info">
        <div class="sighting-silhouette">
          ${sawfishPath}
        </div>
        <div class="sighting-detail">
          <h4>${transName.commonName}</h4>
          <p class="scientific-name" style="font-size:0.8rem; margin:0;">${transName.scientificName}</p>
          <p style="font-size:0.75rem; color:#10b981; font-weight:600; text-transform:uppercase; margin-top:4px;">
            ${uiTranslations[currentLang]["sighting-released-safely"]}
          </p>
        </div>
      </div>
      <div class="sighting-count">
        <strong>${sightingsCount}</strong>
        <span>${uiTranslations[currentLang]["sighting-count-desc"]}</span>
      </div>
    `;

    latestSightingContainer.append(badge);
  }

  function renderRecentCatchList(records) {
    if (!recentCatchList) return;
    recentCatchList.innerHTML = "";

    const visibleRecords = records;

    if (storageUnavailableReason) {
      renderRecordsEmptyState("storage-unavailable", 0);
      return;
    }

    if (visibleRecords.length === 0) {
      renderRecordsEmptyState("zero-filtered", 0);
      return;
    }

    if (visibleRecords.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td colspan="7" style="text-align:center; color:var(--text-muted); font-style:italic;">
          ${currentLang === "ar" ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø³Ø¬Ù„Ø§Øª ØµÙŠØ¯ Ù…Ø³Ø¬Ù„Ø©" : "No catches recorded"}
        </td>
      `;
      recentCatchList.append(row);
      return;
    }

    let renderedCount = 0;
    let invalidCount = 0;
    let renderFailureCount = 0;

    visibleRecords.forEach((r, index) => {
      if (!isValidCatchRecord(r)) {
        invalidCount += 1;
        console.warn(`${RECORDS_DEBUG_PREFIX} Skipping invalid record at index ${index}.`, r);
        return;
      }

      try {
      const trans = translateFish({ id: r.id, commonName: r.species, scientificName: r.scientificName, status: r.conservationStatus }, currentLang);
      const row = document.createElement("tr");

      // Format Date
      const dateObj = new Date(r.dateTime);
      const formattedDate = dateObj.toLocaleDateString(currentLang === "ar" ? "ar-AE" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) + " " + dateObj.toLocaleTimeString(currentLang === "ar" ? "ar-AE" : "en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });

      const outcomeClass = r.outcome.toLowerCase() === "released" ? "released" : "kept";
      const outcomeText = r.outcome === "Released" ? uiTranslations[currentLang]["opt-released"] : uiTranslations[currentLang]["opt-kept"];
      const statusPillClass = statusClass(trans.status);

      row.innerHTML = `
        <td><strong>${trans.commonName}</strong></td>
        <td style="white-space:nowrap;">${formattedDate}</td>
        <td>
          <div class="location-cell-inner">
            <span class="material-symbols-outlined">location_on</span>
            ${currentLang === "ar" && r.locationName === "Dubai" ? "Ø¯Ø¨ÙŠ" : 
              currentLang === "ar" && r.locationName === "Abu Dhabi" ? "Ø£Ø¨ÙˆØ¸Ø¨ÙŠ" : 
              currentLang === "ar" && r.locationName === "Sharjah" ? "Ø§Ù„Ø´Ø§Ø±Ù‚Ø©" : r.locationName}
          </div>
        </td>
        <td><span class="outcome-badge ${outcomeClass}">${outcomeText}</span></td>
        <td>${r.quantity}</td>
        <td><span class="status-pill ${statusPillClass}" style="padding: 2px 6px; font-size:0.68rem;">${trans.status}</span></td>
        <td><strong>${r.confidence}%</strong></td>
      `;

      recentCatchList.append(row);
      renderedCount += 1;
      } catch (error) {
        renderFailureCount += 1;
        console.error(`${RECORDS_DEBUG_PREFIX} Failed to render record row at index ${index}.`, error, r);
      }
    });

    console.debug(RECORDS_DEBUG_PREFIX, "Rendered records table.", {
      filteredRecordCount: visibleRecords.length,
      renderedCount: renderedCount,
      invalidCount: invalidCount,
      renderFailureCount: renderFailureCount,
      firstRecord: visibleRecords[0] || null
    });

    if (renderedCount === 0) {
      renderRecordsEmptyState(renderFailureCount > 0 ? "render-failed" : "invalid-records", invalidCount);
    }
  }

  function exportRecordsToCsv() {
    const records = getCatchRecords();
    if (records.length === 0) return;
    const csvContent = buildRecordsCsv(records);
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `marine_lens_catch_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function clearAllRecords() {
    const msg = currentLang === "ar" ? "Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ù…Ø³Ø­ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø³Ø¬Ù„Ø§ØªØŸ" : "Are you sure you want to clear all catch records?";
    if (confirm(msg)) {
      safeStorageSet(LOCAL_STORAGE_KEY, JSON.stringify([]));
      renderDashboard();
    }
  }

  function switchToTab(targetTabId) {
    const activeButton = Array.from(navItems).find(
      (item) => item.getAttribute("data-tab") === targetTabId
    );

    navItems.forEach((item) => item.classList.remove("active"));
    if (activeButton) {
      activeButton.classList.add("active");
    }

    tabContents.forEach((screen) => {
      if (screen.id === targetTabId) {
        screen.classList.remove("hidden");
      } else {
        screen.classList.add("hidden");
      }
    });

    if (targetTabId === "dashboardScreen") {
      requestAnimationFrame(renderDashboard);
    }

  }

  function setupBottomNavigation() {
    navItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTabId = btn.getAttribute("data-tab");
        switchToTab(targetTabId);
      });
    });
  }

  /* ==========================================================================
     Core Classifier logic
     ========================================================================== */

  function normalizeLabel(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function updateIdentifyButtonState() {
    identifyButton.disabled = !(selectedFile && imageLoaded && modelReady && hasFishData);
  }

  function buildFishIndex() {
    if (
      window.FINSIGHT_FISH_INDEX &&
      typeof window.FINSIGHT_FISH_INDEX === "object" &&
      Object.keys(window.FINSIGHT_FISH_INDEX).length > 0
    ) {
      return window.FINSIGHT_FISH_INDEX;
    }

    const index = {};

    (window.FINSIGHT_FISH_DATA || []).forEach((entry) => {
      const keys = [
        entry.commonName,
        entry.scientificName,
        entry.id,
      ];

      keys.forEach((value) => {
        const normalized = normalizeLabel(value);
        if (normalized) {
          index[normalized] = entry;
        }
      });
    });

    return index;
  }

  const fishIndex = buildFishIndex();

  function findFishByLabel(label) {
    const normalized = normalizeLabel(label);
    return fishIndex[normalized] || null;
  }

  async function loadModel() {
    try {
      const [loadedModel, metadataResponse] = await Promise.all([
        window.tf.loadLayersModel(MODEL_URL),
        fetch(MODEL_METADATA_URL),
      ]);
      const metadata = await metadataResponse.json();

      model = loadedModel;
      modelLabels = Array.isArray(metadata.labels) ? metadata.labels : [];
      modelReady = true;
      updateIdentifyButtonState();
    } catch (error) {
      console.error("Failed to load TensorFlow.js model.", error);
      setValidation(validations[currentLang]["err-model"]);
    }
  }

  function openPhotoPicker(event) {
    event.stopPropagation();
    photoInput.click();
  }

  function openCamera(event) {
    event.stopPropagation();
    cameraInput.click();
  }

  function resetInputValue(input) {
    input.value = "";
  }

  function setValidation(message) {
    validationMessage.textContent = message;
  }

  function getExtension(fileNameValue) {
    const normalized = fileNameValue.toLowerCase();
    const dotIndex = normalized.lastIndexOf(".");
    return dotIndex >= 0 ? normalized.slice(dotIndex) : "";
  }

  function isAcceptedFile(file) {
    const extension = getExtension(file.name);
    const hasAcceptedExtension = ACCEPTED_EXTENSIONS.includes(extension);
    const hasAcceptedType = file.type === "" || ACCEPTED_TYPES.includes(file.type);

    return hasAcceptedExtension && hasAcceptedType;
  }

  function validateFile(file) {
    if (!file) {
      return validations[currentLang]["err-select"];
    }

    if (!isAcceptedFile(file)) {
      return validations[currentLang]["err-type"];
    }

    if (file.size > MAX_FILE_SIZE) {
      return validations[currentLang]["err-size"];
    }

    return "";
  }

  function showPreview(file) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    selectedFile = file;
    imageLoaded = false;
    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    fileName.textContent = file.name;

    uploadInstructions.classList.add("hidden");
    previewCard.classList.remove("hidden");
    updateIdentifyButtonState();
    resultsPanel.classList.add("hidden");
    analysisPanel.classList.add("hidden");
    setValidation("");
  }

  function resizeImage(file, maxDim = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type || "image/jpeg",
                  lastModified: Date.now()
                });
                resolve(resizedFile);
              } else {
                resolve(file);
              }
            },
            file.type || "image/jpeg",
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file) {
    const validationError = validateFile(file);

    if (validationError) {
      setValidation(validationError);
      removeImage();
      return;
    }

    try {
      const resizedFile = await resizeImage(file, 800);
      showPreview(resizedFile);
    } catch (err) {
      console.error("Image resizing failed, using original:", err);
      showPreview(file);
    }
  }

  function removeImage(event) {
    if (event) {
      event.stopPropagation();
    }

    selectedFile = null;
    currentPredictionResult = null;
    clearTimeout(analysisTimer);
    analysisTimer = null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }

    imagePreview.removeAttribute("src");
    imageLoaded = false;
    fileName.textContent = uiTranslations[currentLang]["no-image"];
    uploadInstructions.classList.remove("hidden");
    previewCard.classList.add("hidden");
    updateIdentifyButtonState();
    analysisPanel.classList.add("hidden");
    resultsPanel.classList.add("hidden");
    resetInputValue(photoInput);
    resetInputValue(cameraInput);
  }

  function buildPredictionResult(predictions) {
    const ranked = predictions
      .map((probability, index) => ({
        label: modelLabels[index],
        probability,
        fish: findFishByLabel(modelLabels[index]),
      }))
      .filter((entry) => entry.fish)
      .sort((left, right) => right.probability - left.probability);

    const primaryEntry = ranked[0];

    if (!primaryEntry) {
      throw new Error("No prediction labels matched the configured fish data.");
    }

    const alternatives = ranked.slice(1, 4).map((entry) => ({
      ...entry.fish,
      confidence: Math.max(1, Math.round(entry.probability * 100)),
    }));

    return {
      primary: {
        ...primaryEntry.fish,
        confidence: Math.max(1, Math.round(primaryEntry.probability * 100)),
      },
      alternatives,
    };
  }

  async function predictSelectedImage() {
    const tensor = window.tf.tidy(() => {
      const pixels = window.tf.browser.fromPixels(imagePreview);
      const resized = window.tf.image.resizeBilinear(pixels, [224, 224]);
      const normalized = resized.toFloat().div(255);
      return normalized.expandDims(0);
    });

    try {
      const output = model.predict(tensor);
      const probabilities = Array.from(await output.data());

      output.dispose();

      return buildPredictionResult(probabilities);
    } finally {
      tensor.dispose();
    }
  }

  function statusClass(status) {
    const normalized = status.toLowerCase();

    if (
      normalized.includes("near threatened") ||
      normalized.includes("data deficient") ||
      normalized.includes("Ù‚Ø±ÙŠØ¨")
    ) {
      return "caution";
    }

    if (
      normalized.includes("endangered") ||
      normalized.includes("vulnerable") ||
      normalized.includes("threatened") ||
      normalized.includes("Ù…Ù‡Ø¯Ø¯Ø©")
    ) {
      return "danger";
    }

    return "safe";
  }

  function renderAlternatives(alternatives) {
    alternativeList.innerHTML = "";

    alternatives.forEach((fish) => {
      const item = document.createElement("article");
      item.className = "alternative-item";

      const textWrap = document.createElement("div");
      const title = document.createElement("h3");
      const meta = document.createElement("p");
      const chip = document.createElement("span");

      title.textContent = fish.commonName;
      meta.textContent = `${fish.scientificName} | ${fish.status}`;
      chip.className = "match-chip";
      chip.textContent = `${fish.confidence}%`;

      textWrap.append(title, meta);
      item.append(textWrap, chip);
      alternativeList.append(item);
    });
  }

  function renderResult(result) {
    currentPredictionResult = result;
    
    // Translate before display
    const fish = translateFish(result.primary, currentLang);
    const pillClass = statusClass(fish.status);

    resultScientific.textContent = fish.scientificName;
    resultName.textContent = fish.commonName;
    
    // Set text percentage score and update dynamic custom property on confidence ring
    confidenceScore.textContent = `${fish.confidence}%`;
    confidenceScore.parentElement.style.setProperty('--match-percent', `${fish.confidence}%`);

    statusPill.className = `status-pill ${pillClass}`;
    statusPill.textContent = fish.status;
    resultStatus.textContent = fish.statusSummary;
    resultHabitat.textContent = fish.habitat;
    resultRegion.textContent = fish.region;
    resultConservation.textContent = fish.conservationNote;
    resultGuidance.textContent = fish.guidance;

    // Reset log input fields
    saveQtyInput.value = 1;
    saveStatusMsg.className = "save-status-msg hidden";
    
    // Auto outcomes logic: if protected, default to Released and disable kept
    if (fish.status.toLowerCase().includes("endangered") || fish.status.toLowerCase().includes("Ù…Ù‡Ø¯Ø¯Ø©")) {
      saveOutcomeSelect.value = "Released";
      saveOutcomeSelect.disabled = true;
    } else {
      saveOutcomeSelect.value = "Released";
      saveOutcomeSelect.disabled = false;
    }

    const translatedAlternatives = result.alternatives.map((alt) =>
      translateFish(alt, currentLang)
    );
    renderAlternatives(translatedAlternatives);

    analysisPanel.classList.add("hidden");
    resultsPanel.classList.remove("hidden");
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function identifyFish() {
    if (!selectedFile || !imageLoaded || !modelReady || !hasFishData) {
      setValidation(validations[currentLang]["err-identify"]);
      return;
    }

    setValidation("");
    clearTimeout(analysisTimer);
    identifyButton.disabled = true;
    resultsPanel.classList.add("hidden");
    analysisPanel.classList.remove("hidden");
    analysisPanel.scrollIntoView({ behavior: "smooth", block: "center" });

    analysisTimer = setTimeout(async () => {
      try {
        const result = await predictSelectedImage();
        renderResult(result);
      } catch (error) {
        console.error("Prediction failed.", error);
        setValidation(validations[currentLang]["err-classify"]);
        analysisPanel.classList.add("hidden");
      } finally {
        updateIdentifyButtonState();
      }
    }, 250);
  }

  function handleLogCatch() {
    if (!currentPredictionResult) {
      saveStatusMsg.textContent = uiTranslations[currentLang]["save-err-no-prediction"];
      saveStatusMsg.className = "save-status-msg error";
      return;
    }

    const fish = currentPredictionResult.primary;
    const outcome = saveOutcomeSelect.value;
    const qty = parseInt(saveQtyInput.value) || 1;

    // Fetch random UAE coastal city to mock location
    const locations = [
      { name: "Dubai", lat: 25.2048, lng: 55.2708 },
      { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
      { name: "Sharjah", lat: 25.3463, lng: 55.4209 }
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];

    const record = {
      id: fish.id,
      species: fish.commonName,
      scientificName: fish.scientificName,
      confidence: fish.confidence,
      outcome: outcome,
      conservationStatus: fish.status,
      quantity: qty,
      dateTime: new Date().toISOString(),
      latitude: loc.lat,
      longitude: loc.lng,
      locationName: loc.name
    };

    saveCatchRecord(record);

    // Show Success notification
    saveStatusMsg.textContent = uiTranslations[currentLang]["save-success"];
    saveStatusMsg.className = "save-status-msg success";

    // Refresh Dashboard counters
    renderDashboard();

    // Disable button to prevent duplicates
    setTimeout(() => {
      saveStatusMsg.classList.add("hidden");
    }, 3000);
  }

  function handleDrop(event) {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    handleFile(file);
  }

  // Drag over drop zone handlers
  function handleDragOver(event) {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  }

  function handleDragLeave(event) {
    if (!dropZone.contains(event.relatedTarget)) {
      dropZone.classList.remove("drag-over");
    }
  }

  function handleDropZoneKeyboard(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      photoInput.click();
    }
  }

  // Register PWA Service Worker
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered scope:", registration.scope);
          
          // Check if controller is already active on first load
          if (navigator.serviceWorker.controller) {
            setModelOfflineReady();
          }
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });

      // Listen for activation complete messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "OFFLINE_READY") {
          setModelOfflineReady();
        }
      });
    }
  }

  // Event Listeners
  choosePhotoButton.addEventListener("click", openPhotoPicker);
  takePhotoButton.addEventListener("click", openCamera);
  removeImageButton.addEventListener("click", removeImage);
  identifyButton.addEventListener("click", () => {
    identifyFish();
  });
  imagePreview.addEventListener("load", () => {
    imageLoaded = true;
    updateIdentifyButtonState();
  });
  imagePreview.addEventListener("error", () => {
    imageLoaded = false;
    updateIdentifyButtonState();
    setValidation(validations[currentLang]["err-load"]);
  });

  photoInput.addEventListener("change", (event) => {
    handleFile(event.target.files[0]);
  });

  cameraInput.addEventListener("change", (event) => {
    handleFile(event.target.files[0]);
  });

  dropZone.addEventListener("click", () => {
    if (!selectedFile) {
      photoInput.click();
    }
  });

  dropZone.addEventListener("dragover", handleDragOver);
  dropZone.addEventListener("dragleave", handleDragLeave);
  dropZone.addEventListener("drop", handleDrop);
  dropZone.addEventListener("keydown", handleDropZoneKeyboard);

  // Save Catch Event
  saveCatchBtn.addEventListener("click", handleLogCatch);
  // Dashboard Filters
  dashboardDateFilter.addEventListener("change", renderDashboard);
  exportCsvBtn.addEventListener("click", exportRecordsToCsv);
  clearAllRecordsBtn.addEventListener("click", clearAllRecords);

  // Language switch toggle listener
  langBtn.addEventListener("click", () => {
    const targetLang = currentLang === "en" ? "ar" : "en";
    switchLanguage(targetLang);
  });

  // Page Load Trigger (deferred background image loading & SW registration)
  window.addEventListener("load", () => {
    document.body.classList.add("bg-loaded");
    registerServiceWorker();
    setupBottomNavigation();
    
    // Seed and draw initial dashboard numbers
    renderDashboard();
  });

  // Init
  updateIdentifyButtonState();
  loadModel();
})();
