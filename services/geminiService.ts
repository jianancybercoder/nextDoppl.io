
import { GoogleGenAI } from "@google/genai";
import { VTONResult, ProviderType, CustomConfig } from "../types.ts";

const SYSTEM_PROMPT = `
你是一個頂尖的 "Doppl-Next VTON Engine" (虛擬試穿引擎)。
任務：
1. 分析使用者圖片與服裝圖片。
2. 生成一張合成後的試穿結果圖像 (VTON)。
3. 提供「虛擬觸感報告 (Phantom Haptics Report)」的 JSON 數據。

# 輸出要求
- 圖像生成：請盡可能生成一張真實感的試穿圖片。如果你的 API 支援直接生成圖像網址，請直接提供。如果你的 API 僅支援文字，請嘗試描述圖像，或輸出一個 Markdown 圖像連結 (如果你能調用繪圖工具)。
- JSON 數據：無論如何，回應的最後必須包含以下 JSON 區塊：

\`\`\`json
{
  "comfort": "文字描述 (如: 柔軟親膚)",
  "weight": "文字描述 (如: 輕盈)",
  "touch": "文字描述 (如: 絲滑)",
  "breathability": "文字描述 (如: 透氣)",
  "scores": {
    "comfort": 8,       // 1-10
    "heaviness": 6,     // 1-10
    "softness": 9,      // 1-10
    "breathability": 7, // 1-10
    "elasticity": 5     // 1-10
  }
}
\`\`\`
`;

// Helper: Parse the analysis text to extract JSON and Image
const parseResponse = (text: string, imageCandidate: string | null = null): VTONResult => {
  let image = imageCandidate;
  let analysisData = {
    comfort: "分析中... (解析失敗)",
    weight: "分析中...",
    touch: "分析中...",
    breathability: "分析中...",
    scores: {
      comfort: 5,
      heaviness: 5,
      softness: 5,
      breathability: 5,
      elasticity: 5
    },
    rawText: text
  };

  // 1. Try to find Image URL in Markdown if no direct image provided
  // Many models (like GPT-4o) might return the image as a markdown link if they use DALL-E internally,
  // or we rely on the client code to handle the image if it came separately.
  if (!image) {
    const imgMatch = text.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) {
      image = imgMatch[1];
    }
  }

  // 2. Parse JSON
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/```\s*([\s\S]*?)\s*```/) || 
                      text.match(/\{[\s\S]*\}/); 

    if (jsonMatch) {
      let jsonStr = jsonMatch[1] || jsonMatch[0];
      // Cleanup common trailing comma errors which models sometimes make
      jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      const parsed = JSON.parse(jsonStr);
      analysisData = { 
        ...analysisData, 
        ...parsed,
        scores: { ...analysisData.scores, ...(parsed.scores || {}) }
      };
    }
  } catch (e) {
    console.warn("JSON Parse failed, attempting heuristic extraction...", e);
  }

  if (!image) {
    // If absolutely no image found
    throw new Error("模型僅返回了文字，未能生成圖像。請確認您使用的模型具有繪圖或 Vision 能力，或透過 Markdown 返回了圖片連結。");
  }

  return {
    image,
    analysis: analysisData
  };
};

// --- Google Gemini Implementation ---
const generateWithGoogle = async (
  apiKey: string,
  modelName: string,
  parts: any[]
): Promise<VTONResult> => {
  const cleanKey = apiKey.trim();
  if (!cleanKey.startsWith("AIza")) {
    throw new Error("Google API Key 格式不正確 (應以 'AIza' 開頭)。");
  }

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  
  const response = await ai.models.generateContent({
    model: modelName || 'gemini-2.5-flash-image',
    contents: { parts: parts },
  });

  const responseParts = response.candidates?.[0]?.content?.parts;
  let imageBase64: string | null = null;
  let textAnalysis: string = "";

  if (responseParts) {
    for (const part of responseParts) {
      if (part.inlineData && part.inlineData.data) {
        imageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textAnalysis += part.text;
      }
    }
  }

  return parseResponse(textAnalysis, imageBase64);
};

// --- Custom (OpenAI Compatible) Implementation ---
const generateWithCustom = async (
  config: CustomConfig,
  customPrompt: string,
  userImageBase64: string,
  userImageMime: string,
  garmentImageBase64: string,
  garmentImageMime: string
): Promise<VTONResult> => {
  const { baseUrl, apiKey, modelName } = config;

  if (!baseUrl) throw new Error("請輸入自定義 API 的 Base URL (例如 https://api.openai.com/v1)");
  if (!apiKey) throw new Error("請輸入自定義 API Key");
  if (!modelName) throw new Error("請輸入自定義模型名稱 (例如 gpt-4o)");

  // Construct OpenAI-compatible message with Vision payload
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    {
      role: "user",
      content: [
        { type: "text", text: `【任務】請根據以下兩張圖片生成 VTON 試穿結果。\n${customPrompt ? `額外指令: ${customPrompt}` : ""}` },
        {
          type: "image_url",
          image_url: {
            url: `data:${userImageMime};base64,${userImageBase64}`
          }
        },
        { type: "text", text: "【輸入A: 使用者】" },
        {
          type: "image_url",
          image_url: {
            url: `data:${garmentImageMime};base64,${garmentImageBase64}`
          }
        },
        { type: "text", text: "【輸入B: 服裝】" }
      ]
    }
  ];

  // Adjust URL logic: Append /chat/completions if the user only provided the base domain
  let endpoint = baseUrl;
  if (!endpoint.endsWith('/chat/completions')) {
     endpoint = endpoint.replace(/\/$/, ""); // Remove trailing slash
     if (!endpoint.endsWith('/v1')) {
        // Some users might input just 'https://api.openai.com', usually we expect 'https://api.openai.com/v1'
        // We won't auto-add /v1 to avoid breaking weird custom paths, but we will check for chat/completions
     }
     endpoint = `${endpoint}/chat/completions`;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin, // Required by OpenRouter
        'X-Title': 'Doppl-Next VTON'           // Required by OpenRouter
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        max_tokens: 4096, // Ensure enough tokens for image generation descriptions or json
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`自定義 API 錯誤 (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("API 回傳內容為空");
    }

    // For Custom models, they usually return text (Markdown image link) rather than inline blob data like Google.
    // parseResponse will handle extracting image links from markdown.
    return parseResponse(content, null);

  } catch (err: any) {
    throw new Error(`連線失敗: ${err.message}`);
  }
};


// --- Main Entry Point ---
export const generateVTON = async (
  provider: ProviderType,
  googleKey: string,
  googleModel: string,
  customConfig: CustomConfig,
  customPrompt: string,
  userImageBase64: string,
  userImageMime: string,
  garmentImageBase64: string,
  garmentImageMime: string
): Promise<VTONResult> => {

  if (provider === 'google') {
    // Construct Google Specific Parts
    const parts: any[] = [
      { text: SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: userImageMime,
          data: userImageBase64
        }
      },
      { text: "【輸入 A：使用者原圖】" },
      {
        inlineData: {
          mimeType: garmentImageMime,
          data: garmentImageBase64
        }
      },
      { text: "【輸入 B：目標服飾】" }
    ];

    if (customPrompt && customPrompt.trim().length > 0) {
      parts.push({ 
        text: `【使用者額外指令】: ${customPrompt}` 
      });
    }

    parts.push({ text: "開始生成試穿圖像與詳細 JSON 數據分析：" });

    return generateWithGoogle(googleKey, googleModel, parts);
  } else {
    // Custom Provider logic
    return generateWithCustom(
      customConfig, 
      customPrompt, 
      userImageBase64, 
      userImageMime, 
      garmentImageBase64, 
      garmentImageMime
    );
  }
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
