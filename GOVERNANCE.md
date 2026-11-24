# AI Governance, Regulatory Applicability & Privacy Notice  
# AI 治理、法規適用性聲明與零收集隱私通知

[繁體中文](#繁體中文) · [English](#english)

> **核心定性聲明**：**DeepGate Zero｜零痕深索** 是一個以 MIT 授權發布的開源、零後端、純靜態瀏覽器介面工具（Client-Side Wrapper）。本專案**不開發、不訓練、不微調、不託管亦不代理任何 AI 模型**，作者亦**不收集、不接收、不儲存亦不處理**任何使用者的 API 密鑰、對話內容或本機檔案。

---

## 繁體中文

### 1. 全球法規與國際標準適用性矩陣（誠實邊界）

本專案堅持實事求是的治理原則，明確區分「適用」、「不適用」與「原則對齊」，避免過度宣稱：

| 法規／標準 | 對本專案作者之適用性 | 事實依據與責任劃分 |
| :--- | :--- | :--- |
| **歐盟《人工智能法案》（EU AI Act, (EU) 2024/1689）** | **不適用（豁免／超出範圍）** | 本專案僅為開源純前端連接介面，不構成 AI 模型提供者（Provider）或高風險 AI 系統（亦適用開源非高風險元件豁免精神）。底層模型提供者為 DeepSeek；若使用者在歐盟或受該法管轄之職場環境使用本介面，使用者本人須獨立承擔**部署者（Deployer）**義務（如人工監督、AI 素養、禁止用於第 5 條禁用場景及高風險合規評估）。 |
| **歐盟《一般資料保護規則》（GDPR）** | **作者非資料控制者／處理者（就對話與密鑰而言）** | 作者無後端伺服器、無追蹤分析、無 Cookies，技術上完全無法存取使用者輸入之資料。請參閱第 2 節關於第三方託管與 API 供應商之資料流說明。 |
| **香港《個人資料（私隱）條例》（PDPO，第 486 章）** | **作者非資料使用者（就對話與密鑰而言）** | 基於零收集架構，作者不控制任何對話或檔案中之個人資料的收集、持有、處理或使用。使用本工具之機構或個人在將包含第三者個人資料之文本送往外部 API 前，須自行履行保障資料原則（DPP 1–6），尤其注意收集目的限制（DPP 3）與資料保安（DPP 4）。 |
| **中國內地網信辦（CAC）及相關法規**（含《生成式人工智能服務管理暫行辦法》、《個保法》等） | **作者不適用** | 本專案不向公眾提供自營生成式 AI 服務，無內地伺服器亦不進行流量中轉代理；底層模型合規與算法備案責任屬 DeepSeek。若使用者涉及受中國內地法規管轄之重要數據或個人信息，須自行評估合法性與跨境合規要求。 |
| **ISO/IEC 42001 (AIMS)、ISO/IEC 27001 (ISMS)、ISO/IEC 27701 (PIMS)** | **不具正式認證；僅屬「技術控制原則對齊」** | ISO 標準認證僅適用於組織之管理體系，而非單一開源程式碼庫。本專案**並未**取得上述任何 ISO 認證；惟其工程設計主動借鏡並落實相關核心控制精神（詳見第 3 節）。 |

---

### 2. 零收集隱私通知與第三方資料流（Zero-Collection Privacy Notice）

* **本專案作者（零收集）**：不設後端 API、不設資料庫、不植入任何第三方追蹤碼（如 Google Analytics）、不使用 Cookies 或任何瀏覽器持久化儲存（`localStorage` / `sessionStorage` / `IndexedDB`）。因此本網站無需亦不顯示 Cookie 同意橫幅。
* **第三方 1 — 靜態託管平台（GitHub Pages）**：本靜態網頁由 GitHub, Inc. 託管。當您的瀏覽器載入頁面時，GitHub 基於網路運作與資安需求，可能會依其《GitHub 隱私聲明》記錄標準連線資訊（如 IP 位址）。
* **第三方 2 — 模型 API 供應商（DeepSeek）**：當您輸入自己的 API Key 並發起請求時，您的瀏覽器會**直接**將請求（包括對話內容與透過本機讀檔功能附加之文字）傳送至 `https://api.deepseek.com`。該等資料之處理、留存、安全審核及潛在之**跨境資料傳輸**完全受您與 DeepSeek 之間的服務條款與隱私政策約束。

---

### 3. 與國際標準控制原則之技術對齊（僅供治理參考，非認證聲明）

| 參考標準領域 | 本專案落實之具體技術與治理控制（Governance-as-Code） |
| :--- | :--- |
| **資訊安全原則（參考 ISO/IEC 27001 精神）** | 最嚴格 CSP（`default-src 'none'`）、零外部 CDN 供應鏈依賴、最小權限 CI 自動化資安門禁（`security-gate.yml`）、私有閉包記憶體鎖鑰、`iframe` 點擊劫持防護、`credentials: "omit"` 與 `cache: "no-store"`。 |
| **隱私工程原則（參考 ISO/IEC 27701 精神）** | 預設隱私（Privacy-by-Design）與極致資料最小化（本地零儲存）、刻意不串接雲端持久化 Files API、15 分鐘閒置自動銷毀、離頁停用 `bfcache`、內建 `sk-` 密鑰防誤傳攔截（DLP）。 |
| **AI 治理原則（參考 ISO/IEC 42001 精神）** | 透明揭露系統能力邊界與 ToS 張力、明確劃分提供者／介面作者／部署者權責、支援主動 `safety_check` 請求與串流事後拒答撤回、提供 `max_tokens` 與前綴緩存透明化以落實資源可控，並強調人工覆核（Human-in-the-Loop）。 |

---

### 4. 使用者責任、禁止用途與免責聲明

1. **使用者獨立責任**：本工具按 MIT 授權「按現狀（AS IS）」提供。使用者須自行決定是否輸入敏感或個人資料，並對其透過自有 API Key 產生之所有提示詞、輸出結果、費用消耗及法規合規承擔全部責任。
2. **不建議／禁止高風險盲用**：切勿在未經專業人工審核的情況下，將 AI 輸出直接作為法律意見、醫療診斷、財務決策或自動化僱傭／紀律處分之唯一依據。
3. **非官方免責**：本專案與 DeepSeek 無任何官方隸屬、贊助或背書關係。本文件僅供開源治理透明之用，**不構成任何司法管轄區之法律意見**。

---

## English

### 1. Regulatory & Standards Applicability Matrix (Honest Boundaries)

This project follows a strict no-compliance-theater approach, explicitly distinguishing between what applies, what does not apply, and which controls are principle-aligned:

| Regulation / Standard | Applicability to Project Author | Factual Basis & Allocation of Responsibility |
| :--- | :--- | :--- |
| **EU AI Act (Regulation (EU) 2024/1689)** | **Not Applicable (Out of Scope / Exempt)** | This repository is a free, open-source, static client-side UI wrapper with no embedded AI model weights, training, or high-risk logic. DeepSeek acts as the upstream model provider. End-users utilizing this interface in professional or EU-regulated contexts independently assume **Deployer** obligations (e.g., human oversight, AI literacy, avoiding Art. 5 prohibited practices, and high-risk assessments). |
| **EU GDPR** | **Author is Neither Controller Nor Processor (for prompts/keys)** | With zero backend, zero analytics, and zero cookies, the author has no technical ability to access or process user prompts, keys, or files. See Section 2 for independent third-party data flows. |
| **Hong Kong PDPO (Cap. 486)** | **Author is Not a Data User (for prompts/keys)** | Under this zero-collection architecture, the author does not control the collection, holding, processing, or use of any personal data entered by users. Organizations or individuals submitting third-party personal data to external APIs remain solely responsible for complying with Data Protection Principles (DPP 1–6), particularly DPP 3 (use limitation) and DPP 4 (data security). |
| **PRC CAC Regulations** (e.g., *Interim Measures for Generative AI Services*, PIPL) | **Not Applicable to Author** | The author does not operate a public generative AI service, host servers in Mainland China, or proxy traffic. Underlying service compliance rests with DeepSeek. Users handling data subject to PRC law remain solely responsible for lawful processing and cross-border compliance. |
| **ISO/IEC 42001 (AIMS), ISO/IEC 27001 (ISMS), ISO/IEC 27701 (PIMS)** | **Not Certified; Principle-Aligned Only** | ISO certifications apply to organizational management systems, not standalone open-source repositories. This project holds **no ISO certification**; however, its technical architecture is deliberately aligned with core control principles from these standards (see Section 3). |

---

### 2. Zero-Collection Privacy Notice & Third-Party Data Flows

* **Project Author (Zero Collection)**: No backend server, no database, no third-party analytics/telemetry, and no cookies or browser persistent storage (`localStorage`, `sessionStorage`, `IndexedDB`). Accordingly, no cookie consent banner is required or displayed.
* **Third Party 1 — Static Hosting (GitHub Pages)**: Static files are served via GitHub, Inc. Standard HTTP connection metadata (such as visitor IP addresses) may be logged by GitHub for security and operational purposes under the GitHub Privacy Statement.
* **Third Party 2 — Model API Provider (DeepSeek)**: Requests initiated using your API Key (including prompts and inline text read from local files) travel **directly** from your browser to `https://api.deepseek.com`. Processing, retention, safety review, and any resulting **cross-border data transfers** are governed solely by your agreement with DeepSeek and DeepSeek's privacy policy.

---

### 3. Technical Alignment with International Standard Principles (Non-Certified)

| Reference Domain | Concrete Governance-as-Code Controls Implemented |
| :--- | :--- |
| **Information Security (Aligned with ISO/IEC 27001 principles)** | Strict CSP (`default-src 'none'`), zero external CDN/supply-chain dependencies, least-privilege CI AppSec gate (`security-gate.yml`), closure RAM-only key custody, `iframe` clickjacking protection, `credentials: "omit"`, and `cache: "no-store"`. |
| **Privacy Engineering (Aligned with ISO/IEC 27701 principles)** | Privacy-by-Design and strict data minimization (zero local persistence), deliberate omission of persistent cloud Files API uploads, 15-minute idle auto-wipe, `bfcache` disabled on unload, and built-in `sk-` DLP leak prevention. |
| **AI Governance (Aligned with ISO/IEC 42001 principles)** | Transparent disclosure of system boundaries and ToS tensions, clear delineation of Provider/Author/Deployer roles, active `safety_check` with post-stream refusal retraction, `max_tokens` and prefix-cache transparency for cost/resource control, and explicit human-in-the-loop guidance. |

---

### 4. User Responsibility, High-Risk Caution & Disclaimer

1. **Sole User Responsibility**: Provided "AS IS" under the MIT License. Users assume full responsibility for data classification before submission, API charges, output verification, and legal compliance within their jurisdiction.
2. **Human Oversight Required**: AI outputs must not be relied upon without qualified human review for legal advice, medical decisions, financial commitments, or automated employment/disciplinary actions.
3. **No Legal Advice & Unofficial Status**: This project is independent and unaffiliated with DeepSeek. Nothing in this document constitutes legal advice in any jurisdiction.
