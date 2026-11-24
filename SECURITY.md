# Security Policy｜資安政策

[繁體中文](#繁體中文) · [English](#english)

---

## 繁體中文

### 1. 支援版本
本專案為純靜態前端單分支部署，僅對 `main` 分支的最新版本提供安全維護與修補。

| 分支／版本 | 安全維護狀態 |
| :--- | :--- |
| `main`（最新版） | ✅ 支援中 |
| 歷史提交／舊版 | ❌ 不支援 |

### 2. 安全架構與威脅模型邊界（Threat Model）
**DeepGate Zero｜零痕深索** 採用純前端 BYOK（Bring Your Own Key）零儲存架構，其安全防線與明確邊界如下：

* **防禦範圍（In Scope）**：
  * 嚴格內容安全政策（CSP）：禁止任何內聯腳本與外部 CDN，`connect-src` 鎖死於 `https://api.deepseek.com`。
  * 私有閉包記憶體鎖鑰：API Key 鎖定後立即自 DOM 清除，不使用 `localStorage`、`sessionStorage`、`IndexedDB` 或 `Cookies`，離頁停用 `bfcache` 並設 15 分鐘閒置自動銷毀。
  * 防 DOM XSS 與防外洩：全面使用 `textContent` 渲染、抗 `iframe` 點擊劫持、本地純文字檔二進位攔截，以及對話與檔案內 `sk-` 密鑰防誤傳攔截（DLP）。
  * 自動化安全門禁：每次推送由 `.github/workflows/security-gate.yml` 強制驗證端點白名單（僅限 `/chat/completions` 與 `/models`）及零儲存鐵律。

* **超出純前端防禦範圍（Out of Scope）**：
  * 使用者裝置本身已感染惡意程式、鍵盤側錄器，或瀏覽器已安裝具高權限的惡意擴充功能（強烈建議於無痕視窗使用）。
  * 使用者自行將密鑰外洩、未於 DeepSeek 平台設定餘額預警所導致的額度盜用。
  * DeepSeek 官方伺服器側之安全事件、風控政策或服務條款變更。

### 3. 漏洞回報流程
如發現任何安全漏洞（例如 CSP 繞過、DOM XSS、記憶體殘留或端點驗證缺陷）：
1. **請勿**在公開 Issues 直接貼出可被利用的攻擊細節。
2. 請透過本儲存庫的 **Security → Advisories → Report a vulnerability**（GitHub 私人安全通報）提交報告。
3. 本專案屬個人開源維護性質，維護者將在合理可行時間內（盡力於 7 個工作日內）確認回覆與評估修補，但不提供商業 SLA 承諾。

---

## English

### 1. Supported Versions
This project is a single-branch static web application. Security updates apply only to the latest commit on `main`.

| Branch / Version | Supported |
| :--- | :--- |
| `main` (Latest) | ✅ Supported |
| Older commits | ❌ Not supported |

### 2. Security Architecture & Threat Model Boundaries
**DeepGate Zero** is a pure client-side, zero-storage BYOK interface with clearly defined trust boundaries:

* **In Scope (Controls Implemented)**:
  * Strict Content Security Policy (`default-src 'none'`, zero inline scripts/CDNs, `connect-src` locked strictly to `https://api.deepseek.com`).
  * Closure RAM-only key custody: API keys are purged from the DOM input upon locking, with zero `localStorage`, `sessionStorage`, `IndexedDB`, or `Cookies`, `bfcache` disabled on unload, and a 15-minute idle auto-wipe.
  * DOM XSS & Leak Prevention: 100% `textContent` rendering, `iframe` clickjacking guard, local text-file null-byte binary blocking, and `sk-` DLP leak detection.
  * Automated Governance Gate: `.github/workflows/security-gate.yml` verifies exact API endpoint allowlisting (`/chat/completions` and `/models` only) and zero-storage invariants on every push.

* **Out of Scope (Client-Side Limitations)**:
  * Compromised user devices, OS-level malware, or malicious third-party browser extensions (users are strongly advised to use Incognito/Private mode).
  * Unauthorized API usage resulting from user mishandling of keys or unconfigured balance alerts on the API provider's platform.
  * Server-side vulnerabilities, rate-limiting changes, or policy actions by DeepSeek.

### 3. Reporting a Vulnerability
If you discover a security issue (e.g., CSP bypass, DOM XSS, memory leakage, or endpoint validation flaw):
1. **Do not** disclose exploit details in public GitHub Issues.
2. Submit a private report via **Security → Advisories → Report a vulnerability** in this repository.
3. As an independent open-source project, reports are handled on a best-effort basis (aiming for an initial response within 7 business days) with no commercial SLA.
