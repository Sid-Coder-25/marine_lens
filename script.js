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
      "header-desc": "Smart Fish Identification and Conservation Guidance",
      "intro-eyebrow": "Marine recognition preview",
      "intro-title": "Identify fish faster, learn what matters next.",
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
      "lang-label": "العربية",
      "status-preparing": "Preparing offline model...",
      "status-ready": "Offline model ready"
    },
    ar: {
      "header-desc": "التعرف الذكي على الأسماك وإرشادات الحفظ",
      "intro-eyebrow": "معاينة التعرف البحري",
      "intro-title": "تعرف على الأسماك بشكل أسرع، واعرف ما يجب فعله بعد ذلك.",
      "intro-copy": "قم بتحميل أو التقاط صورة واضحة لسمكة لتحديد فصيلتها ومعرفة حالة حفظها والقوانين المتعلقة بها.",
      "guidance-1": "حافظ على وضوح رؤية السمكة.",
      "guidance-2": "استخدم إضاءة جيدة وكافية.",
      "guidance-3": "تجنب الصور الباهتة أو البعيدة.",
      "upload-eyebrow": "إدخال الصورة",
      "upload-title": "أضف صورة سمكة",
      "dropzone-title": "أفلت الصورة هنا",
      "dropzone-help": "ملفات JPG أو JPEG أو PNG أو WEBP حتى 10 ميجابايت.",
      "btn-choose": "اختر صورة",
      "btn-take": "التقط صورة",
      "preview-eyebrow": "الصورة المحددة",
      "btn-remove": "إزالة الصورة",
      "btn-identify": "تعرف على السمكة",
      "scanner-eyebrow": "مصنف الصور",
      "scanner-title": "مراجعة خصائص الصورة",
      "scanner-text": "تحليل خصائص الصورة بمقارنتها بقاعدة بيانات الكائنات البحرية المحلية.",
      "results-eyebrow": "نتيجة التعرف",
      "results-title": "الفصيلة المرجحة",
      "results-match": "مطابقة",
      "label-habitat": "الموئل البيئي",
      "label-region": "المنطقة والقوانين",
      "label-conservation": "حالة الحفظ",
      "label-guidance": "الإرشادات المسؤولة",
      "alt-eyebrow": "مطابقات محتملة أخرى",
      "alt-title": "بدائل النموذج",
      "no-image": "لم يتم اختيار صورة",
      "lang-label": "English",
      "status-preparing": "جاري تحضير النموذج للعمل بدون إنترنت...",
      "status-ready": "النموذج جاهز للعمل بدون اتصال"
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
      "err-select": "الرجاء اختيار صورة سمكة للمتابعة.",
      "err-type": "الرجاء اختيار صورة بصيغة JPG أو JPEG أو PNG أو WEBP.",
      "err-size": "حجم الصورة أكبر من 10 ميجابايت. الرجاء اختيار ملف أصغر.",
      "err-identify": "الرجاء إضافة صورة سمكة صالحة قبل بدء التعرف.",
      "err-load": "تعذر تحميل الصورة المحددة.",
      "err-model": "تعذر تحميل نموذج التعرف على الأسماك.",
      "err-classify": "تعذر تصنيف الصورة بواسطة النموذج."
    }
  };

  const fishTranslations = {
    "green-sawfish": {
      commonName: "سمكة المنشار الخضراء",
      scientificName: "بريستيس زيجسرون",
      status: "مهددة بالانقراض بدرجة قصوى",
      statusSummary: "نوع محمي: يُحظر الصيد في جميع أنحاء الإمارات. لا تنشر الشبكة وأطلق سراحها فوراً إذا تم صيدها بالخطأ.",
      habitat: "المياه الساحلية الضحلة والبحيرات ومصبات الأنهار ومناطق المانغروف.",
      region: "يُحظر صيدها في جميع أنحاء دولة الإمارات العربية المتحدة",
      conservationNote: "حرجة",
      guidance: "لا تصطاد هذا الحيوان أو تحتفظ به أو تنقله أو تبيعه. إذا تم صيده بالخطأ، أبقه في الماء، وتجنب التعامل مع المنشار، واقطع خيط الصيد أو الشبكة إذا لزم الأمر، وأطلق سراحه على الفور. أبلغ السلطة البيئية المعنية بالمشاهدة."
    },
    "halavi-guitarfish": {
      commonName: "سمكة الجيتار الحلاوي",
      scientificName: "جلاوكوستيجوس حلاوي",
      status: "مهددة بالانقراض بدرجة قصوى",
      statusSummary: "راي محمي: لا تنشر الشبكة. أطلق سراحه فوراً إذا تم صيدها بالخطأ.",
      habitat: "المياه الساحلية الضحلة فوق القيعان الرملية أو الطينية.",
      region: "لا تصطادها أو تحتفظ بها",
      conservationNote: "حرجة",
      guidance: "لا تحتفظ بهذا الحيوان. في أبوظبي، يُحظر صيد أو بيع أو الاحتفاظ بالراي بجميع أنواعه. إذا تم صيده بالخطأ، اتركه في الماء، وأزل خيط الصيد أو الشبكة بعناية، وأطلق سراحه فوراً."
    },
    "hammour": {
      commonName: "هامور",
      scientificName: "إيبينيفيلوس كويويديس",
      status: "غير مهدد",
      statusSummary: "صيد محدود: حد أقصى 2 لكل شخص يومياً و8 لكل قارب يومياً في أبوظبي.",
      habitat: "الشعاب المرجانية، القيعان الصخرية، المانغروف، مصبات الأنهار والمياه الساحلية الضحلة.",
      region: "الحد الأقصى 2 لكل شخص يومياً في أبوظبي",
      conservationNote: "متوسط",
      guidance: "في أبوظبي، يجوز للصياد الهاوي الاحتفاظ بحد أقصى بسمكتين هامور برتقالية النقط يومياً، وبحد أقصى 8 سمكات لكل قارب يومياً. أطلق سراح الأسماك الإضافية وأي أسماك صغيرة بشكل واضح. يتطلب الأمر رخصة صيد ترفيهية صالحة."
    },
    "sultan-ibrahim": {
      commonName: "سلطان إبراهيم",
      scientificName: "نيميبتيروس جابونيكوس",
      status: "غير مهدد",
      statusSummary: "مسموح بالصيد: احتفظ فقط بالأسماك البالغة التي تم صيدها بشكل قانوني وتجنب مناطق الصيد المحظورة.",
      habitat: "القيعان الرملية والطينية في المياه الساحلية والإقليمية.",
      region: "يُسمح بالصيد بترخيص ساري المفعول",
      conservationNote: "منخفض",
      guidance: "يمكن الاحتفاظ بالسمكة عند صيدها بشكل قانوني مع رخصة صيد ترفيهية سارية المفعول. لا تصطد في المناطق المحمية، أو القنوات الملاحية، أو المواقع المحددة بلوحات ممنوع الصيد. أطلق سراح الأسماك الصغيرة جداً."
    },
    "kingfish": {
      commonName: "كنعد (سمك الملك)",
      scientificName: "سكومبيروموروس كومرسون",
      status: "قريب من التهديد",
      statusSummary: "قاعدة موسمية: يُحظر الصيد من 15 أغسطس إلى 15 أكتوبر. حد أبوظبي: 3 لكل شخص و12 لكل قارب يومياً.",
      habitat: "المياه الساحلية والإقليمية المفتوحة، غالباً بالقرب من الشعاب المرجانية والمناطق التي تحتوي على أسراب من الأسماك الصغيرة.",
      region: "موسم الحظر: من 15 أغسطس إلى 15 أكتوبر",
      conservationNote: "متوسط",
      guidance: "لا تصطد الكنعد من 15 أغسطس إلى 15 أكتوبر. خارج موسم الحظر، يجوز لصيادي أبوظبي الترفيهيين الاحتفاظ بحد أقصى بـ 3 سمكات كنعد لكل شخص يومياً، وبحد أقصى 12 سمكة لكل قارب يومياً. أطلق سراح السمكة إذا كان الموسم مغلقاً أو تم الوصول للحد المسموح به."
    },
    "black-pomfret": {
      commonName: "حلواي أسود (زبيدي أسود)",
      scientificName: "باراستروماتيوس نيجر",
      status: "غير مهدد",
      statusSummary: "مسموح بالصيد: احتفظ فقط بالأسماك البالغة التي تم صيدها بشكل قانوني وتجنب مناطق الصيد المحظورة.",
      habitat: "المياه الساحلية والإقليمية، خاصة فوق القيعان الرملية أو الطينية.",
      region: "يُسمح بالصيد بترخيص ساري المفعول",
      conservationNote: "منخفض",
      guidance: "يمكن الاحتفاظ بالسمكة عند صيدها بشكل قانوني مع رخصة صيد ترفيهية سارية المفعول. لا تصطد في المناطق المحمية، أو القنوات الملاحية، أو المواقع المحددة بلوحات ممنوع الصيد. أطلق سراح الأسماك الصغيرة جداً."
    },
    "unknown": {
      commonName: "سمكة غير معروفة",
      scientificName: "غير محدد",
      status: "غير معروف",
      statusSummary: "تحديد غير مؤكد: لا تفترض أن هذه السمكة قانونية للاحتفاظ بها.",
      habitat: "لا يمكن تحديد البيئة المناسبة لعدم وضوح فصيلة السمكة.",
      region: "لا تحتفظ بها حتى يتم تحديد فصيلتها",
      conservationNote: "غير مؤكد",
      guidance: "لا تحتفظ بالسمكة طالما أن هويتها غير مؤكدة. التقط صورة جانبية واضحة أخرى. إذا تم صيدها بالفعل، أطلق سراحها بعناية ما لم تؤكد سلطة مختصة جواز الاحتفاظ بها قانونياً."
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
  }

  function setModelOfflineReady() {
    if (modelStatus) {
      modelStatus.setAttribute("data-translate", "status-ready");
      modelStatus.classList.add("ready");
      modelStatus.textContent = uiTranslations[currentLang]["status-ready"];
    }
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
      normalized.includes("قريب")
    ) {
      return "caution";
    }

    if (
      normalized.includes("endangered") ||
      normalized.includes("vulnerable") ||
      normalized.includes("threatened") ||
      normalized.includes("مهددة")
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

  // Language switch toggle listener
  langBtn.addEventListener("click", () => {
    const targetLang = currentLang === "en" ? "ar" : "en";
    switchLanguage(targetLang);
  });

  // Page Load Trigger (deferred background image loading & SW registration)
  window.addEventListener("load", () => {
    document.body.classList.add("bg-loaded");
    registerServiceWorker();
  });

  // Init
  updateIdentifyButtonState();
  loadModel();
})();
