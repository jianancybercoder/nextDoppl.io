
# ✨ Doppl-Next VTON Engine

> **次世代 AI 虛擬試穿引擎 (Next-Gen Virtual Try-On Engine)**  
> Powered by Google Gemini 3 Pro & Phantom Haptics Technology

![Status](https://img.shields.io/badge/Status-Online-green)
![Model](https://img.shields.io/badge/AI-Gemini_3_Pro_%7C_OpenAI_Compatible-blue)
![Tech](https://img.shields.io/badge/Tech-React_19_+_Tailwind-38bdf8)
![License](https://img.shields.io/badge/License-MIT-gray)

## 🚀 立即體驗 (Try it Live)

👉 **[https://jianancybercoder.github.io/nextDoppl/](https://jianancybercoder.github.io/nextDoppl/)**

*(無需安裝，打開瀏覽器即可使用。請記得準備您的 API Key)*

---

## 📖 專案簡介 (Introduction)

**Doppl-Next** 是一款利用最先進生成式 AI 技術打造的虛擬試穿 (VTON) 應用程式。不同於傳統的 2D 圖像疊加技術，Doppl-Next 利用 **Google Gemini 3** 的多模態能力（或支援 Vision 的 OpenAI 相容模型），深入理解布料物理特性、光影環境與人體姿態，合成出具備 **8K 級攝影真實感** 的試穿效果。

此外，本專案首創 **「幻影觸感 (Phantom Haptics)」** 技術，不僅生成視覺圖像，還能透過 AI 推論布料的觸覺數據（如透氣度、重量感、彈性），並以動態圖表可視化呈現。

---

## 🌟 核心亮點 (Core Highlights)

### 1. 🧠 雙模引擎驅動 (Dual-Engine Architecture)
系統採用通用閘道器設計 (Universal Gateway)，賦予使用者極高的彈性：
- **Google Native**: 直接整合 Gemini 2.5/3.0 模型，享受原生的多模態優勢。
- **Custom Provider**: 支援任何相容 OpenAI Chat API 格式的供應商 (如 **OpenRouter**, **DeepSeek**, **LocalAI**)，只要模型具備 Vision 能力即可使用。

### 2. 🖐️ 幻影觸感技術 (Phantom Haptics)
Doppl-Next 不僅讓你看見，還讓你「感覺」到衣服：
- **AI 觸感推論**：模型分析服裝材質，輸出 5 維度物理數據。
- **數據視覺化**：透過雷達圖 (Radar Chart) 與進度條展示：
  - ✨ **舒適度 (Comfort)**
  - 🌬️ **透氣度 (Breathability)**
  - 🪶 **重量感 (Weight/Heaviness)**
  - 🧶 **柔軟度 (Softness/Touch)**
  - ⚡ **彈性係數 (Elasticity)**

### 3. 🌍 全球化與 RWD 設計 (Global & Responsive)
- **多語系切換 (I18N)**：內建 **繁體中文 (Traditional Chinese)** 與 **英文 (English)** 介面，並支援 AI 分析報告的語言自動切換。
- **行動優先 (Mobile First)**：優化的 RWD 介面，無論是手機、平板或桌機都能流暢操作。

---

## 🚀 主要功能 (Features)

*   **雙重圖片上傳**：支援拖曳上傳「使用者照片」與「服裝照片」。
*   **自定義連線測試**：設定 Custom Provider 時，可即時測試 Base URL 與 API Key 的連線狀態。
*   **自然語言微調 (Refinement)**：可輸入文字指令（例如：「把袖子捲起來」、「讓衣服更緊身一點」）來控制生成結果。
*   **四階段生成視覺化**：即時顯示 AI 處理狀態（語意分析 -> 物理翹曲 -> 光場合成 -> 觸感渲染）。
*   **高解析度下載**：一鍵下載合成後的試穿結果。
*   **暖色調護眼介面**：Paper (亮色) 與 Obsidian (暗色) 主題切換。

---

## 📖 使用指南 (Usage Guide)

### 1. 準備 API Key
本應用程式需要串接 AI 模型，您有兩種選擇：

*   **Google Gemini (推薦)**:
    *   前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 申請 Key。
    *   *優點：速度快、部分模型免費額度高。*
*   **Custom Provider**:
    *   準備支援 Vision 模型的 API (如 GPT-4o, Claude 3.5 Sonnet via OpenRouter)。
    *   *優點：可嘗試不同模型的生成風格。*

### 2. 設定引擎
進入網頁後，點擊右上角的 **設定 (Settings)** 圖示：
- 選擇供應商 (Google 或 Custom)。
- 貼上 API Key。
- (選填) 使用「測試連線」功能確保設定正確。

### 3. 開始試穿
1.  **上傳照片**：左側上傳使用者，右側上傳服裝。
2.  **輸入指令** (選填)：如「請將上衣紮進褲子裡」。
3.  **啟動引擎**：點擊生成按鈕，約 10-20 秒後即可查看結果與觸感分析。

---

## 🛠️ 技術堆疊 (Tech Stack)

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS (Custom Theme)
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **Architecture**: Universal API Gateway / Adapter Pattern
*   **Assets**: Lucide React Icons

---

## ⚠️ 常見問題 (FAQ)

*   **Q: 為什麼生成失敗顯示 403?**
    *   A: 通常是 Google API Key 權限不足，或該地區不支援特定的 Pro 模型。請嘗試切換至 `Gemini 2.5 Flash`。
*   **Q: 自定義模型連線失敗?**
    *   A: 請檢查 Base URL 是否正確 (通常需包含 `/v1`)，以及模型名稱 (Model ID) 是否打錯。
*   **Q: 圖片有人臉扭曲?**
    *   A: 雖然系統已設定「保持臉部不變」的強力 Prompt，但部分模型 (尤其是較舊的模型) 仍可能重繪臉部。建議使用 `Gemini 3 Pro` 或 `GPT-4o` 等高階模型。

---

Created with ❤️ by the Doppl-Next Team.
