
export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING', // Semantic Analysis
  WARPING = 'WARPING',     // Physics-Based Warping
  COMPOSITING = 'COMPOSITING', // Composition & Inpainting
  RENDERING = 'RENDERING',   // Environmental Rendering
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface VTONResult {
  image: string;
  analysis: {
    comfort: string;
    weight: string;
    touch: string;
    breathability: string;
    // New numerical data for visualization
    scores: {
      comfort: number;      // 1-10
      heaviness: number;    // 1-10 (Weight)
      softness: number;     // 1-10 (Touch)
      breathability: number;// 1-10
      elasticity: number;   // 1-10 (Extra)
    };
    rawText: string;
  }
}

// Removed hardcoded text from here to move to locales.ts, keeping only the phase structure if needed, 
// but for now, we will map status to text in the component directly.
export const GENERATION_PHASES_IDS = [
  AppStatus.ANALYZING,
  AppStatus.WARPING,
  AppStatus.COMPOSITING,
  AppStatus.RENDERING
];

// --- New Types for Custom Provider ---
export type ProviderType = 'google' | 'custom';
export type Language = 'zh-TW' | 'en';

export interface CustomConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  detail?: string;
}

// --- Universal Gateway Interfaces (Core Design) ---

export interface UniversalApiInput {
  baseUrl?: string;         // Optional for Google SDK
  apiKey: string;
  model: string;
  
  // VTON Specific Payload Context
  messages?: any[];         // For Chat Completion APIs
  parts?: any[];            // For Google SDK
  
  // Generic Options
  temperature?: number;
  maxTokens?: number;
}

export interface UniversalApiResponse {
  content: string;         // The text content (JSON analysis)
  images: string[];        // Extracted images (Base64 or URL)
  raw?: any;               // Debug raw response
}
