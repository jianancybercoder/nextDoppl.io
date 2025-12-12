
import { AppStatus } from './types.ts';

export const translations = {
  'zh-TW': {
    appTitle: 'Doppl-Next',
    heroTitle: '真實物理 VTON 引擎',
    heroSubtitle: '上傳照片與服裝。利用高階物理模擬與 Phantom Haptics 觸感分析技術，合成 8K 級的攝影擬真試穿效果。',
    settings: {
      title: '引擎設定',
      provider: 'AI 模型供應商',
      apiKey: 'API Key',
      getKey: '取得 Key',
      modelSelect: '模型選擇',
      modelHint: '* 推薦使用 Flash 2.5 以獲得最佳速度與免費額度。',
      customHint: '適用於支援 OpenAI Chat API 格式的服務 (如 OpenRouter, DeepSeek)。模型必須具備 Vision 能力。',
      baseUrl: 'Base URL',
      baseUrlHint: '* 請輸入包含 /v1 的完整 Base Path (如果需要)。',
      modelId: 'Model ID',
      testConn: '測試連線',
      testing: '連線測試中...',
      testSuccess: '連線驗證成功',
      testFail: '連線失敗',
      complete: '完成設定'
    },
    upload: {
      userLabel: '目標使用者',
      userSub: '全身或半身照片',
      garmentLabel: '目標服飾',
      garmentSub: '平拍或模特兒照片',
      clickToUpload: '點擊上傳',
      dragDrop: '或拖放',
      remove: '移除'
    },
    prompt: {
      label: '詳細微調需求 (選填)',
      labelRefine: '微調需求 / 追加指令',
      placeholder: '例如：請保留我的手錶，並讓衣服看起來更寬鬆一點...',
      placeholderRefine: '例如：請把褲子改短一點、讓光線亮一點...'
    },
    actions: {
      reset: '重來',
      generate: '啟動 VTON 引擎',
      regenerate: '依據新設定重新生成',
      processing: 'PROCESSING...',
      setupKey: '設定 Key 並啟動'
    },
    result: {
      title: '生成結果',
      download: '儲存圖片',
      hapticsTitle: 'PHANTOM HAPTICS',
      dataVis: '數據可視化',
      profile: '物理屬性圖譜',
      metrics: {
        comfort: '舒適度',
        breathability: '透氣性',
        touch: '觸感',
        weight: '重量感',
        elasticity: '彈性係數'
      }
    },
    phases: {
      [AppStatus.ANALYZING]: { label: '第一階段：語意與材質分析', detail: '識別使用者姿勢，解析服裝布料物理屬性...' },
      [AppStatus.WARPING]: { label: '第二階段：物理模擬翹曲', detail: '建構 3D 體積，模擬重力與布料張力...' },
      [AppStatus.COMPOSITING]: { label: '第三階段：光場合成', detail: '處理遮擋、邊緣融合與細節修飾...' },
      [AppStatus.RENDERING]: { label: '第四階段：觸感推論與渲染', detail: '計算穿著舒適度數據並輸出最終影像...' },
    },
    errors: {
      noKey: '請先設定 Google API Key。',
      incompleteCustom: '請完整填寫自定義 API 設定。',
      processFailed: '圖片處理失敗，請嘗試其他檔案。',
      genFailed: '生成失敗。請檢查設定或網路連線。'
    }
  },
  'en': {
    appTitle: 'Doppl-Next',
    heroTitle: 'Hyper-Realistic VTON Engine',
    heroSubtitle: 'Upload photos and garments. Synthesize 8K photorealistic virtual try-on results using advanced physics simulation and Phantom Haptics analysis.',
    settings: {
      title: 'Engine Settings',
      provider: 'AI Provider',
      apiKey: 'API Key',
      getKey: 'Get Key',
      modelSelect: 'Model Selection',
      modelHint: '* Flash 2.5 is recommended for best speed and free tier.',
      customHint: 'For services supporting OpenAI Chat API format (e.g., OpenRouter, DeepSeek). Model must have Vision capabilities.',
      baseUrl: 'Base URL',
      baseUrlHint: '* Enter full Base Path including /v1 if required.',
      modelId: 'Model ID',
      testConn: 'Test Connection',
      testing: 'Testing...',
      testSuccess: 'Connection Verified',
      testFail: 'Connection Failed',
      complete: 'Done'
    },
    upload: {
      userLabel: 'Target User',
      userSub: 'Full/Half Body Photo',
      garmentLabel: 'Target Garment',
      garmentSub: 'Flat Lay or Model Photo',
      clickToUpload: 'Click to Upload',
      dragDrop: 'or Drag & Drop',
      remove: 'Remove'
    },
    prompt: {
      label: 'Refinement Instructions (Optional)',
      labelRefine: 'Refine / Additional Prompts',
      placeholder: 'E.g., Keep my watch visible and make the fit looser...',
      placeholderRefine: 'E.g., Make the pants shorter, brighten the lighting...'
    },
    actions: {
      reset: 'Reset',
      generate: 'Ignite Engine',
      regenerate: 'Regenerate',
      processing: 'PROCESSING...',
      setupKey: 'Set Key & Start'
    },
    result: {
      title: 'Visual Output',
      download: 'Save Image',
      hapticsTitle: 'PHANTOM HAPTICS',
      dataVis: 'DATA VISUALIZATION',
      profile: 'Physics Profile',
      metrics: {
        comfort: 'Comfort',
        breathability: 'Breathability',
        touch: 'Softness & Touch',
        weight: 'Weight & Density',
        elasticity: 'Elasticity'
      }
    },
    phases: {
      [AppStatus.ANALYZING]: { label: 'Phase 1: Semantic & Material Analysis', detail: 'Identifying pose, parsing fabric physics...' },
      [AppStatus.WARPING]: { label: 'Phase 2: Physics-Based Warping', detail: 'Building 3D volume, simulating gravity & tension...' },
      [AppStatus.COMPOSITING]: { label: 'Phase 3: Optical Composition', detail: 'Handling occlusion, edge fusion & detailing...' },
      [AppStatus.RENDERING]: { label: 'Phase 4: Haptic Inference & Rendering', detail: 'Calculating comfort data & rendering final output...' },
    },
    errors: {
      noKey: 'Please set your Google API Key first.',
      incompleteCustom: 'Please complete the Custom API settings.',
      processFailed: 'Failed to process image. Please try another file.',
      genFailed: 'Generation failed. Check settings or network connection.'
    }
  }
};
