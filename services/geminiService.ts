
import { GoogleGenAI } from "@google/genai";
import { VTONResult, ProviderType, CustomConfig, UniversalApiInput, UniversalApiResponse, ConnectionTestResult, Language } from "../types.ts";

const getSystemPrompt = (lang: Language) => `
你是由 Gemini 3 Pro 驅動的頂尖 "Doppl-Next VTON Engine" (虛擬試穿引擎)。

**核心任務 (Core Task)**：
將「目標服飾 (Input B)」完美合成至「使用者 (Input A)」身上，生成一張極具真實感的虛擬試穿照片。

**關鍵約束 (CRITICAL CONSTRAINTS) - 必須嚴格遵守**：
1. **絕對保留身份特徵 (Identity Preservation)**：
   - 使用者的臉部、五官、表情、髮型、髮色、膚色與體型特徵必須 **100% 保持原樣**。
   - **嚴禁** 重繪臉部或讓臉部變形。這是最高優先級指令。
2. **極致物理模擬 (Hyper-Realistic Physics)**：
   - **重力與垂墜感**：模擬布料在身體上的自然垂墜，考慮重力影響。
   - **材質與紋理**：保留服裝的高解析度紋理 (Texture)、光澤與細節。
   - **皺褶生成**：根據人體姿態生成自然的衣物皺褶。
   - **遮擋處理 (Occlusion)**：正確處理頭髮、手部、飾品與衣物的遮擋關係 (例如：頭髮披在肩膀時，衣服應在頭髮下方)。
3. **光影融合 (Lighting Integration)**：
   - 衣服的光影、色溫與對比度必須與使用者原圖的環境光完美匹配。

**輸出格式 (Output Format)**：
1. **圖像生成**：請生成合成後的 VTON 圖像。
2. **觸感數據 (Phantom Haptics)**：圖像後方必須包含以下 JSON 區塊，除此之外不要有多餘的廢話。
   **注意**：JSON 中的 "comfort", "weight", "touch", "breathability" 的文字描述必須使用 **${lang === 'zh-TW' ? '繁體中文' : '英文 (English)'}** 撰寫。

\`\`\`json
{
  "comfort": "文字描述 (如: 柔軟親膚，適合全天穿著)",
  "weight": "文字描述 (如: 輕盈如羽毛)",
  "touch": "文字描述 (如: 絲滑涼感)",
  "breathability": "文字描述 (如: 高透氣網眼結構)",
  "scores": {
    "comfort": 8,       // 1-10
    "heaviness": 6,     // 1-10 (1=輕, 10=重)
    "softness": 9,      // 1-10
    "breathability": 7, // 1-10
    "elasticity": 5     // 1-10
  }
}
\`\`\`
`;

// ============================================================================
// 1. Response Normalizer (Core Design: Adapts different API shapes)
// ============================================================================

const normalizeApiResponse = (data: any): UniversalApiResponse => {
  // 1. Standard OpenAI Chat Completion
  if (data.choices && data.choices[0]?.message) {
    return {
      content: data.choices[0].message.content || "",
      images: [], // Images usually embedded in content as markdown or separate
      raw: data
    };
  }
  
  // 2. OpenAI Image Generation (DALL-E style) - if used purely for image
  if (data.data && Array.isArray(data.data)) {
    const images = data.data.map((d: any) => d.url || d.b64_json).filter(Boolean);
    return {
      content: "", // Image endpoints rarely return text
      images: images,
      raw: data
    };
  }

  // 3. EvoLink / Other wrappers
  if (data.output) {
     const images = Array.isArray(data.output) ? data.output.map((o:any) => o.url || o) : [data.output];
     return {
       content: "",
       images: images,
       raw: data
     };
  }

  // 4. Raw text/markdown response fallback
  if (typeof data === 'string') {
    return {
      content: data,
      images: [],
      raw: data
    };
  }

  throw new Error("Unknown API response format. Response Normalization Failed.");
};


// ============================================================================
// 2. Universal Gateway (Core Design: The Single Fetcher)
// ============================================================================

const constructEndpoint = (baseUrl: string): string => {
  let endpoint = baseUrl.replace(/\/$/, ""); 
  if (!endpoint.endsWith('/chat/completions')) {
     endpoint = `${endpoint}/chat/completions`;
  }
  return endpoint;
};

const callGenericServer = async (input: UniversalApiInput): Promise<UniversalApiResponse> => {
  const { baseUrl, apiKey, model, messages, maxTokens = 4096 } = input;

  if (!baseUrl) throw new Error("Base URL is required for custom providers.");

  const endpoint = constructEndpoint(baseUrl);

  const body = {
    model: model,
    messages: messages,
    max_tokens: maxTokens,
    stream: false 
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Doppl-Next VTON'
      },
      body: JSON.stringify(body)
    });

    const responseText = await res.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`API Response is not JSON (Likely HTML/Error Page).\nEndpoint: ${endpoint}\nSnippet: ${responseText.slice(0, 100)}...`);
    }

    if (!res.ok) {
      const errMsg = data.error?.message || data.message || JSON.stringify(data);
      throw new Error(`API Error (${res.status}): ${errMsg}`);
    }

    return normalizeApiResponse(data);

  } catch (error: any) {
    // Re-throw with clean message
    throw error;
  }
};


// ============================================================================
// 3. Google SDK Adapter (Maps SDK to Universal Output)
// ============================================================================

const callGoogleSdk = async (input: UniversalApiInput, systemPrompt: string): Promise<UniversalApiResponse> => {
  const { apiKey, model, parts } = input;
  
  if (!apiKey.startsWith("AIza")) {
    throw new Error("Google API Key format incorrect (Must start with AIza).");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts;
    let content = "";
    let images: string[] = [];

    if (responseParts) {
      for (const part of responseParts) {
        if (part.inlineData && part.inlineData.data) {
          images.push(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
        } else if (part.text) {
          content += part.text;
        }
      }
    }

    return {
      content,
      images,
      raw: response
    };

  } catch (error: any) {
    if (error.message?.includes('403')) {
      throw new Error("Google 403 Forbidden: Check API Key or Model Access.");
    }
    throw error;
  }
};


// ============================================================================
// 4. Connection Tester
// ============================================================================

export const testCustomConnection = async (config: CustomConfig): Promise<ConnectionTestResult> => {
  const { baseUrl, apiKey, modelName } = config;

  if (!baseUrl || !apiKey || !modelName) {
    return { ok: false, message: "⚠️ 請填寫完整欄位 (URL, Key, Model)" };
  }

  const endpoint = constructEndpoint(baseUrl);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1 // Minimal cost
      })
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errData = await res.json();
        errorMsg = errData.error?.message || errData.message || errorMsg;
      } catch (e) {
        const text = await res.text();
        errorMsg = `Server Error: ${text.slice(0, 50)}...`;
      }

      if (res.status === 401) return { ok: false, message: "❌ 認證失敗 (401)", detail: "API Key 無效或過期" };
      if (res.status === 404) return { ok: false, message: "❌ 找不到資源 (404)", detail: "模型名稱錯誤 或 Base URL 不正確" };
      
      return { ok: false, message: `❌ 連線失敗 (${res.status})`, detail: errorMsg };
    }

    // Success
    return { ok: true, message: "✅ 連線成功 (Connection Verified)" };

  } catch (error: any) {
    return { ok: false, message: "❌ 網路錯誤 (Network Error)", detail: error.message };
  }
};


// ============================================================================
// 5. VTON Business Logic (Orchestrator)
// ============================================================================

// Helper: Extract Final Result from Normalized Output
const parseVtonResult = (response: UniversalApiResponse): VTONResult => {
  const { content, images } = response;
  
  let finalImage = images.length > 0 ? images[0] : null;
  let analysisData = {
    comfort: "Analyzing... (Parse Failed)",
    weight: "Analyzing...",
    touch: "Analyzing...",
    breathability: "Analyzing...",
    scores: {
      comfort: 5, heaviness: 5, softness: 5, breathability: 5, elasticity: 5
    },
    rawText: content
  };

  // 1. If no direct image, check Markdown in content
  if (!finalImage) {
    const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) {
      finalImage = imgMatch[1];
    }
  }

  // 2. Parse Phantom Haptics JSON
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/```\s*([\s\S]*?)\s*```/) || 
                      content.match(/\{[\s\S]*\}/); 

    if (jsonMatch) {
      let jsonStr = jsonMatch[1] || jsonMatch[0];
      // Sanitize JSON
      jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      const parsed = JSON.parse(jsonStr);
      analysisData = { 
        ...analysisData, 
        ...parsed,
        scores: { ...analysisData.scores, ...(parsed.scores || {}) }
      };
    }
  } catch (e) {
    console.warn("JSON Parse failed", e);
  }

  if (!finalImage) {
    throw new Error("Model returned text but NO image. Ensure the model has Vision/Image Generation capabilities.");
  }

  return {
    image: finalImage,
    analysis: analysisData
  };
};

export const generateVTON = async (
  provider: ProviderType,
  googleKey: string,
  googleModel: string,
  customConfig: CustomConfig,
  customPrompt: string,
  userImageBase64: string,
  userImageMime: string,
  garmentImageBase64: string,
  garmentImageMime: string,
  language: Language = 'zh-TW'
): Promise<VTONResult> => {

  // A. Prepare Data (Independent of Provider)
  const activeSystemPrompt = getSystemPrompt(language);
  
  // B. Call Appropriate Adapter
  let response: UniversalApiResponse;

  if (provider === 'google') {
    // Google SDK specific parts structure
    const parts: any[] = [
        { inlineData: { mimeType: userImageMime, data: userImageBase64 } },
        { text: "【輸入 A：使用者原圖 (User Image)】\n(CRITICAL: 保持臉部與身份特徵 100% 不變，僅更換服裝)" },
        { inlineData: { mimeType: garmentImageMime, data: garmentImageBase64 } },
        { text: "【輸入 B：目標服飾 (Garment Image)】" }
    ];
    
    if (customPrompt?.trim()) {
        parts.push({ text: `【使用者額外指令 (User Instruction)】: ${customPrompt}\n(再次強調：臉部必須保持原樣)` });
    }
    parts.push({ text: "開始生成高擬真試穿圖像 (Generate Photorealistic VTON Image)：" });

    response = await callGoogleSdk({
        apiKey: googleKey,
        model: googleModel || 'gemini-2.5-flash-image',
        parts: parts
    }, activeSystemPrompt);

  } else {
    // Custom OpenAI-compatible structure
    const messages = [
        { role: "system", content: activeSystemPrompt },
        { 
          role: "user", 
          content: [
            { type: "text", text: `【任務】請根據以下兩張圖片生成 VTON 試穿結果。\n${customPrompt ? `額外指令: ${customPrompt}` : ""}` },
            { type: "image_url", image_url: { url: `data:${userImageMime};base64,${userImageBase64}` } },
            { type: "text", text: "【輸入A: 使用者 (保持臉部不變)】" },
            { type: "image_url", image_url: { url: `data:${garmentImageMime};base64,${garmentImageBase64}` } },
            { type: "text", text: "【輸入B: 服裝】" }
          ]
        }
    ];

    response = await callGenericServer({
        baseUrl: customConfig.baseUrl,
        apiKey: customConfig.apiKey,
        model: customConfig.modelName,
        messages: messages
    });
  }

  // C. Normalize Result (Universal Output -> VTON UI Format)
  return parseVtonResult(response);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1]; 
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};
