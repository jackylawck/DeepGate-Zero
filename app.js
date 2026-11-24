(() => {
  "use strict";

  // 1. 凍結核心設定，防止執行期竄改
  const CONFIG = Object.freeze({
    CHAT_ENDPOINT: "https://api.deepseek.com/chat/completions",
    MODELS_ENDPOINT: "https://api.deepseek.com/models",
    IDLE_TIMEOUT_MS: 15 * 60 * 1000, // 閒置 15 分鐘自動銷毀記憶體
    SYNC_TIMEOUT_MS: 10 * 1000,      // /models 同步逾時上限 10 秒
    HISTORY_WARN_THRESHOLD: 40,      // 滿 20 輪（40 條訊息）提醒重置對話以控制成本
    MAX_FILE_BYTES: 512 * 1024,      // 本地純文字檔讀取上限 512 KB
    KEY_REGEX: /^sk-[A-Za-z0-9_-]{10,200}$/,
    MODEL_ID_REGEX: /^[A-Za-z0-9._:/-]{2,100}$/,
    LEAK_DETECT_REGEX: /\bsk-[A-Za-z0-9_-]{16,}\b/
  });

  const I18N = Object.freeze({
    zh: Object.freeze({
      pageTitle: "DeepGate Zero｜零痕深索",
      zhTitle: "零痕深索",
      badge: "純前端 · 閉包記憶體 · 本地零儲存",
      clickjackMsg: "⚠️ 安全警告：偵測到此頁面正被其他網站以框架（iframe）嵌入，為保護您的 API Key，系統已自動停用輸入功能。請直接開啟官方網址。",
      securityTitle: "🔒 資安與治理邊界聲明：",
      securityBody: "本工具無後端、無 LocalStorage、無 Cookies，且不呼叫雲端 Files API。API Key 與本機文字檔僅暫存於私有記憶體（RAM），閒置 15 分鐘或關閉分頁即自動銷毀。請注意：本機零痕跡不等於 API 供應商伺服器零留存，且官方條款原則上不建議於瀏覽器使用密鑰；強烈建議搭配「無痕視窗」、於 DeepSeek 平台開啟「餘額預警」並以小額專用密鑰使用。",
      apiKeyLabel: "DeepSeek API Key",
      statusEmpty: "尚未載入密鑰",
      statusLockedPrefix: "🔒 已鎖定於 RAM：",
      lockBtn: "鎖定載入",
      lockedBtn: "已鎖定",
      wipeBtn: "一鍵銷毀",
      modelLabel: "選擇模型",
      syncBtn: "同步最新模型",
      syncingBtn: "同步中...",
      modelChat: "deepseek-chat（通用對話）",
      modelReasoner: "deepseek-reasoner（深度推理）",
      modelCustom: "自訂模型 ID...",
      customModelPlaceholder: "輸入官方模型 ID（例如 deepseek-flash）",
      maxTokensLabel: "輸出上限",
      maxTokensAuto: "預設（不設限）",
      presetLabel: "快速場景：",
      presetGeneral: "通用助手",
      presetTranslate: "中英專業互譯",
      presetPolish: "公文 / 電郵潤飾",
      presetSummarize: "重點摘要分析",
      newChatBtn: "新對話（保留密鑰）",
      emptyState: "請在上方貼上您的 DeepSeek API Key 並點擊「鎖定載入」，即可直接開始對話。",
      attachBtn: "📎 讀取本機文字檔",
      attachHint: "純本地記憶體讀取（.txt / .md / .csv / .json / 程式碼，上限 512 KB），絕不上傳至雲端 Files API",
      promptPlaceholder: "輸入您的問題或貼上文字... (Enter 發送，Shift+Enter 換行)",
      sendBtn: "發送",
      stopBtn: "停止生成",
      copyBtn: "複製",
      copiedBtn: "已複製",
      footerText: "DeepGate Zero 零痕深索 · 獨立開源純前端工具 · 直連 api.deepseek.com · 非官方出品",
      alertNoKey: "請先輸入並鎖定有效的 DeepSeek API Key（以 sk- 開頭）。",
      alertInvalidKey: "API Key 格式不正確，請確認為 sk- 開頭且不含空白或換行。",
      alertInvalidModel: "請輸入有效的自訂模型 ID（僅限英數與 - _ . / :）。",
      alertKeyInPrompt: "🛡️ 防外洩攔截：系統偵測到您的對話內容疑似包含 API Key（sk-...），已中止發送以防密鑰寫入對話紀錄。",
      alertKeyInFile: "🛡️ 防外洩攔截：所選檔案內容疑似包含 API Key（sk-...），系統已拒載並清除該檔案。",
      alertFileEmpty: "所選檔案沒有可讀取的文字內容。",
      alertFileTooLarge: "檔案超過 512 KB 安全上限（防止誤耗大量 Token），請節錄需要的片段後貼上。",
      alertFileBinary: "偵測到非純文字檔案（例如 PDF、Word 或圖片）。為維持零外部依賴與不碰雲端 Files API，請先複製內文再貼入對話框。",
      alertFileReadErr: "讀取本機檔案失敗，請確認檔案未受損並重試。",
      confirmPresetSwitch: "目前對話仍在進行中。切換「快速場景」會改寫 System Prompt 並導致前綴緩存（Prefix Cache）失效，增加後續輸入費用。\n\n確定直接切換嗎？（按「取消」後可先點「新對話」以保持最佳緩存效率）",
      historyLongWarn: "💡 成本提醒：目前對話已累積超過 20 輪，持續附帶完整歷史將增加 Token 消耗，建議點擊「新對話（保留密鑰）」保持成本可控。",
      newChatNotice: "已開啟新對話並重置緩存起點，RAM 中的 API Key 仍保持鎖定。",
      syncSuccessPrefix: "已成功從官方接口同步最新可用模型（共 ",
      syncSuccessSuffix: " 個）。",
      wipedManual: "已徹底清除私有記憶體中的 API Key、已載入文字檔與所有對話紀錄。",
      wipedIdle: "為保障資安，系統因閒置超過 15 分鐘已自動銷毀記憶體中的 API Key、文字檔與對話紀錄。",
      refusalNotice: "🛡️ 內容審核撤回：官方安全機制已攔截或撤回此輪回覆，系統已自動清除已渲染內容且不會寫入對話紀錄。",
      reasoningStopped: "（推理階段已由使用者手動中斷；以上思考內容已保留，未寫入後續對話上下文）",
      reasoningTruncated: "（輸出已達上限或未產生正文；以上思考內容已保留，未寫入後續對話上下文）",
      errTimeout: "連線逾時（超過 10 秒未回應）：請檢查網路狀態後重試。",
      err400: "請求參數錯誤（HTTP 400）：請檢查所選模型 ID 或輸出上限是否受官方支援，或點擊「同步最新模型」。",
      err401: "驗證失敗（HTTP 401）：API Key 無效或已被撤銷，請點擊「一鍵銷毀」後重新輸入。",
      err402: "餘額不足（HTTP 402）：您的 DeepSeek 開放平台帳戶餘額不足，請先充值。",
      err404: "找不到模型或接口（HTTP 404）：請點擊「同步最新模型」更新可用清單。",
      err429: "請求過於頻繁或觸發限流（HTTP 429）：請稍候片刻再試。",
      errGeneric: "連線失敗，請檢查網路連線或稍後重試：",
      usageTokens: "Tokens",
      usageCacheHit: "前綴緩存命中"
    }),
    en: Object.freeze({
      pageTitle: "DeepGate Zero | Zero-Storage DeepSeek Gateway",
      zhTitle: "Zero-Storage Gateway",
      badge: "Client-Only · Closure RAM · Local Zero-Storage",
      clickjackMsg: "⚠️ Security Alert: This page is embedded inside an external iframe. Input has been disabled to protect your API Key. Please open the official URL directly.",
      securityTitle: "🔒 Security & Governance Boundaries: ",
      securityBody: "No backend, no LocalStorage, no Cookies, and no cloud Files API. Your API Key and local text files live strictly in private closure RAM, auto-wiped after 15 mins idle or upon closing the tab. Note: Local zero-storage does not mean zero-retention on the API provider's servers, and DeepSeek ToS discourages browser-side keys. Use Incognito mode with a low-balance dedicated key and platform balance alerts.",
      apiKeyLabel: "DeepSeek API Key",
      statusEmpty: "No Key Loaded",
      statusLockedPrefix: "🔒 Locked in RAM: ",
      lockBtn: "Lock to RAM",
      lockedBtn: "Locked",
      wipeBtn: "Wipe RAM",
      modelLabel: "Select Model",
      syncBtn: "Sync Models",
      syncingBtn: "Syncing...",
      modelChat: "deepseek-chat (General)",
      modelReasoner: "deepseek-reasoner (Reasoning)",
      modelCustom: "Custom Model ID...",
      customModelPlaceholder: "Enter official model ID (e.g. deepseek-flash)",
      maxTokensLabel: "Max Output",
      maxTokensAuto: "Default (Auto)",
      presetLabel: "Presets:",
      presetGeneral: "General Assistant",
      presetTranslate: "EN/ZH Pro Translator",
      presetPolish: "Business Email Polish",
      presetSummarize: "Executive Summary",
      newChatBtn: "New Chat (Keep Key)",
      emptyState: "Paste your DeepSeek API Key above and click 'Lock to RAM' to start safely.",
      attachBtn: "📎 Read Local Text File",
      attachHint: "Local RAM read only (.txt / .md / .csv / .json / code, max 512 KB). Never uploaded to cloud Files API.",
      promptPlaceholder: "Type your message or paste text... (Enter to send, Shift+Enter for new line)",
      sendBtn: "Send",
      stopBtn: "Stop",
      copyBtn: "Copy",
      copiedBtn: "Copied",
      footerText: "DeepGate Zero · Independent Open-Source Client · Direct to api.deepseek.com · Unofficial",
      alertNoKey: "Please enter and lock a valid DeepSeek API Key (starting with sk-) first.",
      alertInvalidKey: "Invalid API Key format. Ensure it starts with 'sk-' and contains no spaces.",
      alertInvalidModel: "Please enter a valid custom Model ID (letters, numbers, and - _ . / : only).",
      alertKeyInPrompt: "🛡️ Leak Guard Blocked: Your message appears to contain an API Key (sk-...). Sending was cancelled to prevent accidental secret leakage.",
      alertKeyInFile: "🛡️ Leak Guard Blocked: The selected file appears to contain an API Key (sk-...). Attachment rejected and cleared.",
      alertFileEmpty: "The selected file contains no readable text.",
      alertFileTooLarge: "File exceeds the 512 KB safety cap (to prevent accidental large token bills). Please paste only the needed excerpt.",
      alertFileBinary: "Binary file detected (e.g., PDF, Word, or image). To stay zero-dependency and avoid cloud Files API, please copy and paste the text directly.",
      alertFileReadErr: "Failed to read the local file. Please verify the file and try again.",
      confirmPresetSwitch: "Switching presets mid-conversation changes the System Prompt and invalidates DeepSeek's Prefix Cache, increasing input token cost.\n\nSwitch anyway? (Click Cancel and use 'New Chat' first to preserve cache efficiency.)",
      historyLongWarn: "💡 Cost Tip: This conversation exceeds 20 turns. Consider clicking 'New Chat (Keep Key)' to keep token costs predictable.",
      newChatNotice: "Started a new chat with a clean cache prefix. Your API Key remains locked in RAM.",
      syncSuccessPrefix: "Synced available models from official API (",
      syncSuccessSuffix: " found).",
      wipedManual: "API Key, attached file, and conversation history have been permanently wiped from RAM.",
      wipedIdle: "Security Auto-Wipe: API Key, attached file, and chat history were purged after 15 minutes of inactivity.",
      refusalNotice: "🛡️ Content Filter Retraction: This response was flagged or refused by the API safety system. Rendered output has been cleared and excluded from chat history.",
      reasoningStopped: "(Reasoning interrupted by user; thinking trace preserved above and excluded from chat context.)",
      reasoningTruncated: "(Output limit reached before final reply; thinking trace preserved above and excluded from chat context.)",
      errTimeout: "Request timed out (over 10s). Please check your connection and try again.",
      err400: "Bad Request (HTTP 400): Check if the selected model ID or max output limit is supported, or click 'Sync Models'.",
      err401: "Authentication Failed (HTTP 401): Invalid or revoked API Key. Click 'Wipe RAM' and try again.",
      err402: "Insufficient Balance (HTTP 402): Please top up your DeepSeek Platform account.",
      err404: "Model Not Found (HTTP 404): Click 'Sync Models' to refresh available model IDs.",
      err429: "Rate Limit Reached (HTTP 429): Too many requests. Please wait a moment.",
      errGeneric: "Connection failed. Please check your network or try again: ",
      usageTokens: "Tokens",
      usageCacheHit: "Prefix Cache Hit"
    })
  });

  const SYSTEM_PRESETS = Object.freeze({
    general: "You are a helpful, accurate, and concise assistant. Reply in the user's language.",
    translate: "You are a professional bilingual translator specializing in Traditional Chinese and English. Translate the user's text accurately, preserving tone, legal/business nuance, and clarity. Provide only the translation unless clarification is needed.",
    polish: "You are an experienced corporate communications editor. Polish the user's draft email or document to be professional, clear, polite, and concise. Maintain the original language unless asked to translate.",
    summarize: "Analyze the provided text and extract key takeaways, action items, and potential risks using clear bullet points in the user's language."
  });

  // 2. 私有閉包狀態（絕不掛載於 window，亦不寫入瀏覽器持久化儲存）
  let ramApiKey = null;
  let maskedKeyHint = "";
  let currentLang = "zh";
  let currentPreset = "general";
  let conversationHistory = [];
  let attachedFile = null;               // 純記憶體暫存：{ name, size, content }
  let fileReadSeq = 0;                   // 讀檔競態序號守衛
  let abortController = null;
  let syncAbortController = null;
  let idleTimerId = null;
  let sessionEpoch = 0;                  // 會話競態守衛：每次重置對話或銷毀即遞增
  let isStreaming = false;               // 串流進行中暫停閒置自動銷毀並防止重複送出
  const noSafetyCheckModels = new Set(); // 按模型粒度記錄不支援 safety_check 的型號

  // DOM 參照
  const clickjackWarning = document.getElementById("clickjackWarning");
  const appMain = document.getElementById("appMain");
  const langToggle = document.getElementById("langToggle");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const lockKeyBtn = document.getElementById("lockKeyBtn");
  const wipeBtn = document.getElementById("wipeBtn");
  const keyStatusPill = document.getElementById("keyStatusPill");
  const modelSelect = document.getElementById("modelSelect");
  const syncModelsBtn = document.getElementById("syncModelsBtn");
  const customModelInput = document.getElementById("customModelInput");
  const maxTokensSelect = document.getElementById("maxTokensSelect");
  const newChatBtn = document.getElementById("newChatBtn");
  const chatBox = document.getElementById("chatBox");
  const fileInput = document.getElementById("fileInput");
  const attachFileBtn = document.getElementById("attachFileBtn");
  const fileChip = document.getElementById("fileChip");
  const fileChipName = document.getElementById("fileChipName");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const attachHint = document.getElementById("attachHint");
  const chatForm = document.getElementById("chatForm");
  const promptInput = document.getElementById("promptInput");
  const sendBtn = document.getElementById("sendBtn");
  const stopBtn = document.getElementById("stopBtn");
  const presetChips = document.querySelectorAll(".chip");

  // 3. 抗點擊劫持（Clickjacking）檢測
  function enforceFrameProtection() {
    let isFramed = false;
    try {
      isFramed = window.top !== window.self;
    } catch (_) {
      isFramed = true;
    }
    if (isFramed) {
      clickjackWarning.classList.remove("hidden");
      appMain.classList.add("hidden");
      return true;
    }
    return false;
  }

  // 4. 閒置自動銷毀計時器（進行中的長推理串流會暫停計時，避免誤中斷）
  function pauseIdleTimer() {
    if (idleTimerId !== null) {
      clearTimeout(idleTimerId);
      idleTimerId = null;
    }
  }

  function resetIdleTimer() {
    pauseIdleTimer();
    if (ramApiKey !== null && !isStreaming) {
      idleTimerId = setTimeout(() => {
        wipeAll("wipedIdle");
      }, CONFIG.IDLE_TIMEOUT_MS);
    }
  }

  // 5. 本地文字檔記憶體管理（零雲端 Files API、二進位攔截、DLP 密鑰防呆）
  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function updateAttachmentUI() {
    if (attachedFile) {
      fileChipName.textContent = `📄 ${attachedFile.name} (${formatBytes(attachedFile.size)})`;
      fileChip.classList.remove("hidden");
      attachHint.classList.add("hidden");
    } else {
      fileChipName.textContent = "";
      fileChip.classList.add("hidden");
      attachHint.classList.remove("hidden");
    }
  }

  function clearAttachedFile() {
    fileReadSeq += 1;
    attachedFile = null;
    if (fileInput) fileInput.value = "";
    updateAttachmentUI();
  }

  async function handleFileSelect() {
    const file = fileInput.files && fileInput.files[0];
    // 立即清空 DOM 檔案控制項，避免保留引用並允許重複選取同名檔
    fileInput.value = "";
    if (!file) return;

    const dict = I18N[currentLang];
    if (file.size === 0) {
      showSystemMessage(dict.alertFileEmpty, "system-alert");
      return;
    }
    if (file.size > CONFIG.MAX_FILE_BYTES) {
      showSystemMessage(dict.alertFileTooLarge, "system-alert");
      return;
    }

    const myEpoch = sessionEpoch;
    const mySeq = ++fileReadSeq;

    try {
      const buf = await file.arrayBuffer();
      if (myEpoch !== sessionEpoch || mySeq !== fileReadSeq) return;

      // 檢測前 8 KB 是否含空位元組（0x00），攔截 PDF / Word / 圖片等二進位檔
      const probeLen = Math.min(buf.byteLength, 8192);
      const probe = new Uint8Array(buf, 0, probeLen);
      for (let i = 0; i < probeLen; i += 1) {
        if (probe[i] === 0) {
          showSystemMessage(I18N[currentLang].alertFileBinary, "system-alert");
          return;
        }
      }

      const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      if (!text.trim()) {
        showSystemMessage(I18N[currentLang].alertFileEmpty, "system-alert");
        return;
      }

      // DLP 防呆：攔截夾帶 API Key 的設定檔或日誌檔
      if (CONFIG.LEAK_DETECT_REGEX.test(text)) {
        showSystemMessage(I18N[currentLang].alertKeyInFile, "system-alert");
        return;
      }

      attachedFile = {
        name: file.name,
        size: file.size,
        content: text
      };
      updateAttachmentUI();
      resetIdleTimer();
    } catch (_) {
      if (myEpoch !== sessionEpoch || mySeq !== fileReadSeq) return;
      showSystemMessage(I18N[currentLang].alertFileReadErr, "system-alert");
    }
  }

  // 6. 更新金鑰狀態 UI（純 textContent）
  function updateKeyStatusUI() {
    const dict = I18N[currentLang];
    if (ramApiKey !== null) {
      keyStatusPill.textContent = `${dict.statusLockedPrefix}${maskedKeyHint}`;
      keyStatusPill.classList.remove("empty");
      keyStatusPill.classList.add("locked");
      apiKeyInput.value = "";
      apiKeyInput.disabled = true;
      apiKeyInput.placeholder = maskedKeyHint;
      lockKeyBtn.disabled = true;
      lockKeyBtn.textContent = dict.lockedBtn;
    } else {
      keyStatusPill.textContent = dict.statusEmpty;
      keyStatusPill.classList.remove("locked");
      keyStatusPill.classList.add("empty");
      apiKeyInput.disabled = false;
      apiKeyInput.placeholder = "sk-...";
      lockKeyBtn.disabled = false;
      lockKeyBtn.textContent = dict.lockBtn;
    }
  }

  // 7. 載入並鎖定密鑰至私有閉包記憶體，立即抹除 DOM 輸入框
  function lockKeyToRam() {
    const candidate = apiKeyInput.value.trim();
    if (!candidate) {
      showSystemMessage(I18N[currentLang].alertNoKey, "system-alert");
      apiKeyInput.focus();
      return false;
    }
    if (!CONFIG.KEY_REGEX.test(candidate)) {
      apiKeyInput.value = "";
      showSystemMessage(I18N[currentLang].alertInvalidKey, "system-alert");
      apiKeyInput.focus();
      return false;
    }

    ramApiKey = candidate;
    maskedKeyHint = `sk-••••${candidate.slice(-4)}`;
    apiKeyInput.value = "";
    updateKeyStatusUI();
    resetIdleTimer();
    return true;
  }

  function ensureKeyReady() {
    if (ramApiKey !== null) return true;
    if (apiKeyInput.value.trim()) {
      return lockKeyToRam();
    }
    showSystemMessage(I18N[currentLang].alertNoKey, "system-alert");
    apiKeyInput.focus();
    return false;
  }

  // 8. 僅清空對話紀錄與暫存檔、保留 RAM 密鑰（與 wipeAll 對稱中斷 sync 與重置按鈕）
  function startNewChat() {
    sessionEpoch += 1;
    isStreaming = false;

    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (syncAbortController) {
      syncAbortController.abort();
      syncAbortController = null;
    }

    clearAttachedFile();
    conversationHistory.length = 0;
    sendBtn.disabled = false;
    stopBtn.classList.add("hidden");
    syncModelsBtn.disabled = false;
    syncModelsBtn.textContent = I18N[currentLang].syncBtn;

    const notice = document.createElement("div");
    notice.className = "empty-state";
    notice.textContent = ramApiKey !== null
      ? I18N[currentLang].newChatNotice
      : I18N[currentLang].emptyState;
    chatBox.replaceChildren(notice);
    resetIdleTimer();
  }

  // 9. 徹底銷毀記憶體中所有敏感資料（密鑰＋文字檔＋對話＋降級快取）
  function wipeAll(noticeKey = "wipedManual") {
    sessionEpoch += 1;
    isStreaming = false;

    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (syncAbortController) {
      syncAbortController.abort();
      syncAbortController = null;
    }
    pauseIdleTimer();

    clearAttachedFile();
    ramApiKey = null;
    maskedKeyHint = "";
    apiKeyInput.value = "";
    conversationHistory.length = 0;
    noSafetyCheckModels.clear();

    sendBtn.disabled = false;
    stopBtn.classList.add("hidden");
    syncModelsBtn.disabled = false;
    syncModelsBtn.textContent = I18N[currentLang].syncBtn;
    updateKeyStatusUI();

    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-state";
    emptyDiv.textContent = I18N[currentLang][noticeKey] || I18N[currentLang].wipedManual;
    chatBox.replaceChildren(emptyDiv);
  }

  // 10. 動態同步官方最新可用模型（GET /models，含 10 秒超時中斷與完整競態守衛）
  async function handleSyncModels() {
    if (!ensureKeyReady()) return;

    const myEpoch = sessionEpoch;
    const dict = I18N[currentLang];
    syncModelsBtn.disabled = true;
    syncModelsBtn.textContent = dict.syncingBtn;

    if (syncAbortController) syncAbortController.abort();
    const mySyncAbort = new AbortController();
    syncAbortController = mySyncAbort;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      mySyncAbort.abort();
    }, CONFIG.SYNC_TIMEOUT_MS);

    try {
      const response = await fetch(CONFIG.MODELS_ENDPOINT, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: {
          "Authorization": `Bearer ${ramApiKey}`
        },
        signal: mySyncAbort.signal
      });

      if (myEpoch !== sessionEpoch || syncAbortController !== mySyncAbort) return;

      if (!response.ok) {
        throw new Error(mapHttpError(response.status));
      }

      const data = await response.json();
      if (myEpoch !== sessionEpoch || syncAbortController !== mySyncAbort) return;

      const models = Array.isArray(data?.data) ? data.data : [];
      const ids = models
        .map((m) => (typeof m?.id === "string" ? m.id.trim() : ""))
        .filter((id) => CONFIG.MODEL_ID_REGEX.test(id));

      if (ids.length === 0) {
        throw new Error(`${dict.errGeneric}Empty model list`);
      }

      const prevSelected = modelSelect.value;
      modelSelect.replaceChildren();

      ids.sort().forEach((id) => {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = id;
        modelSelect.appendChild(opt);
      });

      const customOpt = document.createElement("option");
      customOpt.value = "__custom__";
      customOpt.setAttribute("data-i18n", "modelCustom");
      customOpt.textContent = I18N[currentLang].modelCustom;
      modelSelect.appendChild(customOpt);

      modelSelect.value = ids.includes(prevSelected) ? prevSelected : ids[0];
      toggleCustomModelVisibility();

      showSystemMessage(
        `${I18N[currentLang].syncSuccessPrefix}${ids.length}${I18N[currentLang].syncSuccessSuffix}`,
        "system-info"
      );
      resetIdleTimer();
    } catch (err) {
      if (myEpoch !== sessionEpoch || syncAbortController !== mySyncAbort) return;
      if (timedOut) {
        showSystemMessage(I18N[currentLang].errTimeout, "system-alert");
      } else if (err.name !== "AbortError") {
        showSystemMessage(err.message, "system-alert");
      }
    } finally {
      clearTimeout(timeoutId);
      if (syncAbortController === mySyncAbort) {
        syncAbortController = null;
        if (myEpoch === sessionEpoch) {
          syncModelsBtn.disabled = false;
          syncModelsBtn.textContent = I18N[currentLang].syncBtn;
        }
      }
    }
  }

  function toggleCustomModelVisibility() {
    if (modelSelect.value === "__custom__") {
      customModelInput.classList.remove("hidden");
      customModelInput.focus();
    } else {
      customModelInput.classList.add("hidden");
    }
  }

  function getActiveModelId() {
    if (modelSelect.value === "__custom__") {
      const customId = customModelInput.value.trim();
      if (!CONFIG.MODEL_ID_REGEX.test(customId)) {
        showSystemMessage(I18N[currentLang].alertInvalidModel, "system-alert");
        customModelInput.focus();
        return null;
      }
      return customId;
    }
    return modelSelect.value;
  }

  // 11. 雙語切換（全 textContent，零 DOM 注入風險）
  function applyLanguage(lang) {
    currentLang = lang;
    const dict = I18N[lang];
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.title = dict.pageTitle;
    langToggle.textContent = lang === "zh" ? "English" : "繁體中文";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key && dict[key]) {
        el.placeholder = dict[key];
      }
    });

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.textContent = dict.copyBtn;
    });

    if (syncAbortController) {
      syncModelsBtn.textContent = dict.syncingBtn;
    }

    updateKeyStatusUI();
  }

  // 12. 安全渲染工具（100% textContent 防範 DOM XSS）
  function clearEmptyState() {
    const empty = chatBox.querySelector(".empty-state");
    if (empty) empty.remove();
  }

  function showSystemMessage(text, className = "system-alert") {
    clearEmptyState();
    const div = document.createElement("div");
    div.className = `msg ${className}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function appendUserMessage(text) {
    clearEmptyState();
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function createAssistantMessageContainer() {
    clearEmptyState();
    const wrapper = document.createElement("div");
    wrapper.className = "msg assistant";

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "reply-body";
    wrapper.appendChild(bodyDiv);

    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
    return { wrapper, bodyDiv };
  }

  function formatUsageText(usage) {
    if (!usage || typeof usage !== "object") return "";
    const dict = I18N[currentLang];
    const parts = [];

    const total = Number(usage.total_tokens || 0);
    if (total > 0) {
      parts.push(`${dict.usageTokens}: ${total.toLocaleString()}`);
    }

    const promptTokens = Number(usage.prompt_tokens || 0);
    const hitTokens = Number(
      usage.prompt_cache_hit_tokens ??
      usage.prompt_tokens_details?.cached_tokens ??
      0
    );

    if (promptTokens > 0 && hitTokens > 0) {
      const ratio = Math.min(100, Math.round((hitTokens / promptTokens) * 100));
      parts.push(`${dict.usageCacheHit}: ${ratio}%`);
    }

    return parts.join(" · ");
  }

  function attachMessageFooter(wrapper, textGetter, usage) {
    const footer = document.createElement("div");
    footer.className = "msg-footer";

    const metaSpan = document.createElement("span");
    metaSpan.className = "usage-meta";
    metaSpan.textContent = formatUsageText(usage);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = I18N[currentLang].copyBtn;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textGetter());
        btn.textContent = I18N[currentLang].copiedBtn;
        setTimeout(() => {
          btn.textContent = I18N[currentLang].copyBtn;
        }, 1500);
      } catch (_) {
        // 忽略剪貼簿權限受限
      }
    });

    footer.appendChild(metaSpan);
    footer.appendChild(btn);
    wrapper.appendChild(footer);
  }

  function mapHttpError(status) {
    const dict = I18N[currentLang];
    if (status === 400) return dict.err400;
    if (status === 401) return dict.err401;
    if (status === 402) return dict.err402;
    if (status === 404) return dict.err404;
    if (status === 429) return dict.err429;
    return `${dict.errGeneric}HTTP ${status}`;
  }

  function isSafetyRefusalChunk(json, choice) {
    const finish = choice?.finish_reason;
    if (finish === "content_filter" || finish === "safety") return true;
    if (choice?.delta?.refusal) return true;
    if (json?.safety_check?.result === "block" || json?.safety_check?.triggered === true) return true;
    if (choice?.safety_check?.result === "block" || choice?.safety_check?.triggered === true) return true;
    return false;
  }

  async function postChatWithSafetyFallback(basePayload, signal) {
    const sendFetch = (bodyObj) => fetch(CONFIG.CHAT_ENDPOINT, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ramApiKey}`
      },
      body: JSON.stringify(bodyObj),
      signal
    });

    if (noSafetyCheckModels.has(basePayload.model)) {
      return sendFetch(basePayload);
    }

    const res = await sendFetch({
      ...basePayload,
      safety_check: { level: "high" }
    });

    if (res.status === 400) {
      let bodyText = "";
      try {
        bodyText = await res.clone().text();
      } catch (_) {
        // 忽略錯誤體讀取異常
      }

      if (/safety_check|unknown (parameter|field)|unrecognized|extra_forbidden/i.test(bodyText)) {
        noSafetyCheckModels.add(basePayload.model);
        try {
          await res.body?.cancel();
        } catch (_) {
          // 忽略連線取消異常
        }
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        return sendFetch(basePayload);
      }
    }

    return res;
  }

  // 13. 串流請求 DeepSeek 官方 API（支援純文字＋本機附載文字檔）
  async function handleSend(e) {
    e.preventDefault();
    if (isStreaming) return;
    if (!ensureKeyReady()) return;

    const modelId = getActiveModelId();
    if (!modelId) return;

    const prompt = promptInput.value.trim();
    if (!prompt && !attachedFile) return;

    // DLP 防呆：攔截對話框或附載檔中的 API Key
    if (CONFIG.LEAK_DETECT_REGEX.test(prompt)) {
      showSystemMessage(I18N[currentLang].alertKeyInPrompt, "system-alert");
      return;
    }
    if (attachedFile && CONFIG.LEAK_DETECT_REGEX.test(attachedFile.content)) {
      clearAttachedFile();
      showSystemMessage(I18N[currentLang].alertKeyInFile, "system-alert");
      return;
    }

    // 成本治理提醒：滿 20 輪及之後每 10 輪提示一次
    if (
      conversationHistory.length >= CONFIG.HISTORY_WARN_THRESHOLD &&
      conversationHistory.length % 20 === 0
    ) {
      showSystemMessage(I18N[currentLang].historyLongWarn, "system-warn");
    }

    // 組合 API 請求內容（含全文）與畫面氣泡顯示（僅顯示檔名摘要，避免長文撐爆介面）
    let apiPrompt = prompt;
    let displayPrompt = prompt;
    if (attachedFile) {
      const sizeStr = formatBytes(attachedFile.size);
      const fileBlock = `--- BEGIN LOCAL FILE: ${attachedFile.name} (${sizeStr}) ---\n${attachedFile.content}\n--- END LOCAL FILE ---`;
      apiPrompt = prompt ? `${fileBlock}\n\n${prompt}` : fileBlock;
      displayPrompt = prompt
        ? `📎 ${attachedFile.name} (${sizeStr})\n\n${prompt}`
        : `📎 ${attachedFile.name} (${sizeStr})`;
      clearAttachedFile();
    }

    appendUserMessage(displayPrompt);
    promptInput.value = "";
    conversationHistory.push({ role: "user", content: apiPrompt });

    const basePayload = {
      model: modelId,
      messages: [
        { role: "system", content: SYSTEM_PRESETS[currentPreset] },
        ...conversationHistory
      ],
      stream: true,
      stream_options: { include_usage: true }
    };

    const maxTokensVal = maxTokensSelect ? maxTokensSelect.value : "auto";
    if (maxTokensVal !== "auto") {
      const parsedMax = Number.parseInt(maxTokensVal, 10);
      if (Number.isFinite(parsedMax) && parsedMax > 0) {
        basePayload.max_tokens = parsedMax;
      }
    }

    const myEpoch = sessionEpoch;
    const myAbort = new AbortController();
    abortController = myAbort;
    isStreaming = true;
    pauseIdleTimer();

    const { wrapper, bodyDiv } = createAssistantMessageContainer();
    let reasoningDiv = null;
    let fullReply = "";
    let fullReasoning = "";
    let latestUsage = null;
    let isRefused = false;

    sendBtn.disabled = true;
    stopBtn.classList.remove("hidden");

    try {
      const response = await postChatWithSafetyFallback(basePayload, myAbort.signal);

      if (myEpoch !== sessionEpoch) return;

      if (!response.ok) {
        throw new Error(mapHttpError(response.status));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (myEpoch !== sessionEpoch) {
          await reader.cancel();
          return;
        }
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") break;

          try {
            const json = JSON.parse(dataStr);
            if (json.usage) {
              latestUsage = json.usage;
            }

            const choice = json.choices?.[0];
            if (!choice) continue;

            if (isSafetyRefusalChunk(json, choice)) {
              isRefused = true;
              break;
            }

            const delta = choice.delta;
            if (!delta) continue;

            if (delta.reasoning_content) {
              if (!reasoningDiv) {
                reasoningDiv = document.createElement("div");
                reasoningDiv.className = "reasoning-block";
                wrapper.insertBefore(reasoningDiv, bodyDiv);
              }
              fullReasoning += delta.reasoning_content;
              reasoningDiv.textContent = fullReasoning;
            }

            if (delta.content) {
              fullReply += delta.content;
              bodyDiv.textContent = fullReply;
            }
            chatBox.scrollTop = chatBox.scrollHeight;
          } catch (_) {
            // 忽略未完整的串流片段
          }
        }

        if (isRefused) {
          await reader.cancel();
          break;
        }
      }

      if (myEpoch !== sessionEpoch) return;

      if (isRefused) {
        conversationHistory.pop();
        if (reasoningDiv) reasoningDiv.remove();
        wrapper.className = "msg refusal";
        bodyDiv.textContent = I18N[currentLang].refusalNotice;
      } else if (fullReply) {
        conversationHistory.push({ role: "assistant", content: fullReply });
        attachMessageFooter(wrapper, () => fullReply, latestUsage);
      } else if (fullReasoning) {
        // 設計取捨：UI 保留已生成的推理過程供查閱，歷史剔除本輪 user，避免模型把未完成推理當成有效回答或引發角色交錯 400
        conversationHistory.pop();
        bodyDiv.classList.add("reply-note");
        bodyDiv.textContent = I18N[currentLang].reasoningTruncated;
        attachMessageFooter(wrapper, () => fullReasoning, latestUsage);
      } else {
        conversationHistory.pop();
        wrapper.remove();
      }
    } catch (err) {
      if (myEpoch !== sessionEpoch) return;

      if (err.name === "AbortError") {
        if (fullReply) {
          conversationHistory.push({ role: "assistant", content: fullReply });
          attachMessageFooter(wrapper, () => fullReply, latestUsage);
        } else if (fullReasoning) {
          // 設計取捨：UI 保留中斷前的推理過程，歷史剔除本輪 user，維持上下文合法性
          conversationHistory.pop();
          bodyDiv.classList.add("reply-note");
          bodyDiv.textContent = I18N[currentLang].reasoningStopped;
          attachMessageFooter(wrapper, () => fullReasoning, latestUsage);
        } else {
          conversationHistory.pop();
          wrapper.remove();
        }
      } else {
        conversationHistory.pop();
        wrapper.remove();
        showSystemMessage(err.message, "system-alert");
      }
    } finally {
      if (abortController === myAbort) {
        abortController = null;
        isStreaming = false;
        if (myEpoch === sessionEpoch) {
          sendBtn.disabled = false;
          stopBtn.classList.add("hidden");
          resetIdleTimer();
        }
      }
    }
  }

  // 14. 事件綁定與頁面銷毀防快取殘留
  if (enforceFrameProtection()) return;

  langToggle.addEventListener("click", () => {
    applyLanguage(currentLang === "zh" ? "en" : "zh");
  });

  lockKeyBtn.addEventListener("click", lockKeyToRam);

  apiKeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lockKeyToRam();
    }
  });

  syncModelsBtn.addEventListener("click", handleSyncModels);
  modelSelect.addEventListener("change", toggleCustomModelVisibility);
  newChatBtn.addEventListener("click", startNewChat);
  wipeBtn.addEventListener("click", () => wipeAll("wipedManual"));

  attachFileBtn.addEventListener("click", () => {
    fileInput.click();
  });
  fileInput.addEventListener("change", handleFileSelect);
  removeFileBtn.addEventListener("click", clearAttachedFile);

  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetPreset = chip.getAttribute("data-preset") || "general";
      if (targetPreset === currentPreset) return;

      if (conversationHistory.length > 0) {
        const proceed = window.confirm(I18N[currentLang].confirmPresetSwitch);
        if (!proceed) return;
      }

      presetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentPreset = targetPreset;
    });
  });

  chatForm.addEventListener("submit", handleSend);

  stopBtn.addEventListener("click", () => {
    if (abortController) abortController.abort();
  });

  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  const purgeMemoryOnLeave = () => {
    sessionEpoch += 1;
    fileReadSeq += 1;
    isStreaming = false;
    pauseIdleTimer();
    ramApiKey = null;
    attachedFile = null;
    conversationHistory.length = 0;
    noSafetyCheckModels.clear();
    apiKeyInput.value = "";
    if (fileInput) fileInput.value = "";
  };

  window.addEventListener("pagehide", purgeMemoryOnLeave);
  // 註解：此 beforeunload 監聽器刻意觸發瀏覽器停用 bfcache（上一頁快取），確保離開頁面後記憶體零殘留
  window.addEventListener("beforeunload", purgeMemoryOnLeave);
})();
