# DeepGate Zero｜零痕深索

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-1d4ed8?style=flat-square)](https://jackylawck.github.io/DeepGate-Zero/)
[![Security & Governance Gate](https://github.com/jackylawck/DeepGate-Zero/actions/workflows/security-gate.yml/badge.svg)](https://github.com/jackylawck/DeepGate-Zero/actions/workflows/security-gate.yml)

**Pure Client-Side, RAM-Only BYOK Gateway for DeepSeek API**  
**純前端、記憶體暫存、本地零儲存的 DeepSeek 自帶密鑰連接器**

[繁體中文](#繁體中文) · [English](#english)

---

## 繁體中文

### 簡介與線上使用
**DeepGate Zero｜零痕深索** 是一個零後端、零外部套件依賴、完全託管於 GitHub Pages 的純靜態網頁工具。使用者只需自備 DeepSeek API Key（BYOK），瀏覽器便會直接連線至官方伺服器（`https://api.deepseek.com`），全程不經任何第三方中轉伺服器。

* **線上使用**：[https://jackylawck.github.io/DeepGate-Zero/](https://jackylawck.github.io/DeepGate-Zero/)

### 核心資安與治理特性
* **閉包記憶體鎖定（RAM-Only）**：點擊「鎖定載入」後，API Key 會即時自 DOM 輸入框抹除並僅存於 JavaScript 私有閉包變數；絕不使用 `localStorage`、`sessionStorage`、`IndexedDB` 或 `Cookies`。閒置 15 分鐘（串流期間自動暫停計時）或離開／重新整理頁面即徹底銷毀，並刻意停用 `bfcache` 防止記憶體殘留。
* **最嚴格 AppSec 防線**：套用零內聯腳本 CSP（`default-src 'none'`、`connect-src https://api.deepseek.com`）、`no-referrer`、`credentials: "omit"`、`cache: "no-store"`、全面使用 `textContent` 防範 DOM XSS、內建抗 `iframe` 點擊劫持偵測，以及防誤貼 `sk-` 密鑰的 DLP 攔截機制。
* **純本機文字檔讀取（不觸碰雲端 Files API）**：支援透過瀏覽器原生記憶體讀取 `.txt`、`.md`、`.csv`、`.json` 及程式碼（上限 512 KB），內建二進位檔（PDF／Word／圖片）自動攔截與檔案內 `sk-` 密鑰掃描；內容僅隨當次對話送出，絕不上傳至會永久留存檔案的雲端 Files API。
* **防過時模型選擇器**：支援一鍵呼叫 `GET /models` 同步帳戶當下可用的最新模型（含 10 秒超時中斷與防連點競態守衛），並支援手動輸入自訂模型 ID。
* **成本與前綴緩存治理（FinOps）**：獨立提供「新對話（保留密鑰）」與「一鍵銷毀」按鈕、單次輸出上限（`max_tokens`）控制、對話中途切換場景之緩存失效提醒、滿 20 輪長對話提醒，並於回覆底部即時顯示 Token 消耗與前綴緩存命中率（Cache Hit %）。
* **主動安全審核與串流拒答撤回**：預設附帶 `safety_check: { level: "high" }`（按模型粒度自動相容降級）；當串流中途或結尾收到安全拒答訊號時，即時撤回已渲染內容並排除於對話歷史之外。
* **自動化零依賴資安門禁（CI）**：透過 GitHub Actions（`security-gate.yml`）於每次提交自動驗證語法、防硬編碼密鑰、零儲存與防 XSS 規則、嚴格 CSP、CSS 無外部連線，並以精準白名單鎖死僅允許連線至 `/chat/completions` 與 `/models`。

### 快速上手
1. 前往 [DeepSeek 開放平台](https://platform.deepseek.com/) 建立一組專用 API Key（建議先開啟餘額預警並以小額充值為主）。
2. 使用瀏覽器**無痕視窗**開啟 [DeepGate Zero](https://jackylawck.github.io/DeepGate-Zero/)。
3. 貼上 `sk-` 密鑰並點擊 **「鎖定載入」**（輸入框將立即清空並顯示綠燈鎖定），即可同步最新模型並開始對話。使用完畢後請點 **「一鍵銷毀」** 或關閉分頁。

### 威脅模型與誠實邊界聲明（使用前必讀）
1. **官方服務條款（ToS）張力**：DeepSeek 開放平台服務條款原則上不建議於瀏覽器客戶端使用 API Key。本工具採用純前端 BYOK 模式（由使用者自行持有並承擔密鑰管理責任），若因個人裝置遭惡意程式感染或惡意瀏覽器插件側錄導致密鑰外洩，在平台風控或帳戶爭議舉證上可能處於不利位置。
2. **本地零痕跡 ≠ 雲端零留存**：本工具僅保證「瀏覽器端與本靜態網頁」不儲存任何密鑰、檔案或對話；所有送出的文字仍會直接傳送至 DeepSeek 官方伺服器，並受其服務條款與隱私政策約束。
3. **非官方獨立專案**：本工具為獨立開源前端介面，與 DeepSeek 官方無任何隸屬關係；若未來官方調整 API 協議、速率限制或客戶端風控策略，可能影響連線表現。

### 推薦安全守則
* 盡量於瀏覽器**無痕視窗（Incognito / Private Mode）**開啟，以隔絕第三方擴充功能讀取網頁內容的風險。
* 為本工具建立**獨立低額度 API Key**，並於 DeepSeek 開放平台開啟**餘額預警**。
* 若需處理 PDF 或 Word 文件，請先於本機複製純文字段落後再貼入對話框。

### 檔案結構（零外部依賴）
```text
.
├── index.html                        # 頁面結構與嚴格 CSP / Referrer 資安標頭
├── style.css                         # 原生響應式樣式（無外部字體或 CDN）
├── app.js                            # 閉包 RAM 狀態機、雙語字典、串流與本地讀檔邏輯
├── README.md                         # 雙語說明與資安邊界文件
└── .github/workflows/security-gate.yml # 零依賴自動化資安與治理門禁
```

---

## English

### Overview & Live Demo
**DeepGate Zero** is a zero-backend, zero-dependency static web client hosted on GitHub Pages. Users bring their own DeepSeek API Key (BYOK), and browser requests connect directly to DeepSeek's official API (`https://api.deepseek.com`) with no middleman server.

* **Live App**: [https://jackylawck.github.io/DeepGate-Zero/](https://jackylawck.github.io/DeepGate-Zero/)

### Security & Governance Highlights
* **Closure RAM-Only Key Custody**: Upon clicking **Lock to RAM**, your API Key is immediately purged from the DOM input and held strictly inside a private JavaScript closure. Zero `localStorage`, `sessionStorage`, `IndexedDB`, or `Cookies`. Auto-wiped after 15 minutes of inactivity (paused during active streaming) or upon leaving/refreshing the page, with `bfcache` intentionally disabled via `beforeunload`.
* **Hardened AppSec Controls**: Strict Content Security Policy (`default-src 'none'`, `connect-src https://api.deepseek.com`), `no-referrer`, `credentials: "omit"`, `cache: "no-store"`, 100% `textContent` rendering (DOM XSS immune), `iframe` clickjacking protection, and DLP guard blocking accidental `sk-` key leakage in prompts or files.
* **Local-Only Text File Reader (No Cloud Files API)**: Reads local plain-text files (`.txt`, `.md`, `.csv`, `.json`, source code; 512 KB cap) strictly in browser RAM via native APIs. Includes null-byte binary detection (blocks PDF/Word/images) and `sk-` leak scanning. Files are sent inline with the current turn and never uploaded to DeepSeek's persistent cloud Files API.
* **Future-Proof Model Picker**: One-click `GET /models` sync (with 10-second timeout and race-condition guards) to fetch all models currently enabled on your account, plus a custom Model ID option.
* **Cost & Prefix Cache Governance (FinOps)**: Separate **New Chat (Keep Key)** vs. **Wipe RAM** actions, per-request `max_tokens` cap selector, mid-conversation preset-switch cache invalidation warning, 20-turn long-history reminder, and per-turn token usage & Prefix Cache Hit % display.
* **Active Safety Check & Post-Stream Refusal Retraction**: Sends `safety_check: { level: "high" }` with automatic per-model fallback if unsupported, and monitors SSE chunks for safety/content-filter signals to retract rendered output cleanly without polluting chat history.
* **Zero-Dependency CI Security Gate**: Automated GitHub Actions workflow (`security-gate.yml`) verifying JS syntax, blocking hardcoded keys, forbidding browser storage APIs & DOM XSS sinks, validating CSP & CSS hygiene, and enforcing an exact endpoint allowlist (`/chat/completions` and `/models` only).

### Quick Start
1. Create a dedicated API Key on the [DeepSeek Platform](https://platform.deepseek.com/) (enable balance alerts and top up a small amount).
2. Open [DeepGate Zero](https://jackylawck.github.io/DeepGate-Zero/) in a browser **Incognito / Private Window**.
3. Paste your `sk-` key and click **Lock to RAM** (the input field clears immediately and turns green), optionally click **Sync Models**, and start chatting. Click **Wipe RAM** or close the tab when done.

### Threat Model & Honest Disclosures
1. **ToS Tension**: DeepSeek's Terms of Service advise against exposing API keys in browser environments. Although BYOK keeps custody solely with the user, key compromise via local malware or malicious browser extensions remains the user's responsibility and may be disadvantaged in platform dispute resolution.
2. **Local Zero-Storage ≠ Cloud Zero-Retention**: This client guarantees zero local persistence in your browser, but submitted prompts and file text are transmitted directly to DeepSeek's servers under DeepSeek's privacy policy and terms.
3. **Unofficial Client**: DeepGate Zero is an independent open-source frontend not affiliated with DeepSeek. Future platform changes to endpoints, rate limits, or client verification policies may affect availability.

### Recommended Best Practices
* Run in **Incognito / Private Mode** to disable third-party browser extensions.
* Use a **dedicated, low-balance API Key** with **balance alerts** enabled on the DeepSeek Platform.
* For PDF or Word documents, copy and paste the required plain-text excerpts directly into the chat input.

### Project Structure (Zero Dependencies)
```text
.
├── index.html                        # Markup with strict CSP & Referrer headers
├── style.css                         # Vanilla responsive CSS (zero external fonts/CDNs)
├── app.js                            # Closure RAM state machine, bilingual i18n, SSE & local file reader
├── README.md                         # Bilingual documentation & governance boundaries
└── .github/workflows/security-gate.yml # Zero-dependency automated AppSec gate
```
