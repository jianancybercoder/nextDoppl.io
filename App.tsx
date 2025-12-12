
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Shirt, User, AlertTriangle, MessageSquare, Key, Eye, EyeOff, ExternalLink, RefreshCw, Trash2, Settings, Sun, Moon, Globe, Server, Box, Check, X } from 'lucide-react';
import ImageUploadCard from './components/ImageUploadCard.tsx';
import ProcessingOverlay from './components/ProcessingOverlay.tsx';
import ResultView from './components/ResultView.tsx';
import { ImageFile, AppStatus, VTONResult, ProviderType, CustomConfig } from './types.ts';
import { generateVTON, fileToBase64 } from './services/geminiService.ts';

// --- Settings Modal Component ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderType;
  setProvider: (p: ProviderType) => void;
  googleApiKey: string;
  setGoogleApiKey: (e: React.ChangeEvent<HTMLInputElement>) => void;
  googleModelName: string;
  setGoogleModelName: (m: string) => void;
  customConfig: CustomConfig;
  setCustomConfig: (k: keyof CustomConfig, v: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  provider,
  setProvider,
  googleApiKey,
  setGoogleApiKey,
  googleModelName,
  setGoogleModelName,
  customConfig,
  setCustomConfig
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-paper dark:bg-charcoal border border-coffee/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-coffee/5 dark:border-white/5 flex items-center justify-between bg-sand/50 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            <h2 className="font-bold text-coffee dark:text-white text-lg font-display">引擎設定</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-coffee/10 dark:hover:bg-white/10 text-coffee/60 dark:text-warm-text/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Provider Switcher */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-coffee/60 dark:text-warm-text/60 uppercase tracking-wider">
                AI 模型供應商
             </label>
             <div className="flex bg-coffee/5 dark:bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setProvider('google')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${provider === 'google' ? 'bg-white dark:bg-obsidian text-accent shadow-sm' : 'text-coffee/50 dark:text-warm-text/50 hover:text-coffee dark:hover:text-warm-text'}`}
                >
                  Google Gemini
                </button>
                <button
                  onClick={() => setProvider('custom')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${provider === 'custom' ? 'bg-white dark:bg-obsidian text-accent shadow-sm' : 'text-coffee/50 dark:text-warm-text/50 hover:text-coffee dark:hover:text-warm-text'}`}
                >
                  Custom / OpenAI
                </button>
             </div>
          </div>

          {/* Google Settings */}
          {provider === 'google' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
               <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-coffee/60 dark:text-warm-text/60 uppercase tracking-wider">API Key</label>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline flex items-center gap-1">
                      取得 Key <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="bg-white dark:bg-obsidian border border-coffee/10 dark:border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-1 focus-within:ring-accent/50 focus-within:border-accent/50 transition-all">
                     <Key size={16} className={googleApiKey ? 'text-green-500' : 'text-coffee/30 dark:text-warm-text/30'} />
                     <input 
                        type={showApiKey ? "text" : "password"}
                        value={googleApiKey}
                        onChange={setGoogleApiKey}
                        placeholder="AIza..."
                        className="bg-transparent border-none outline-none flex-1 text-sm text-coffee dark:text-warm-text font-mono placeholder-coffee/30 dark:placeholder-warm-text/30"
                     />
                     <button onClick={() => setShowApiKey(!showApiKey)} className="text-coffee/40 dark:text-warm-text/40 hover:text-coffee dark:hover:text-warm-text">
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-coffee/60 dark:text-warm-text/60 uppercase tracking-wider">模型選擇</label>
                  <div className="bg-white dark:bg-obsidian border border-coffee/10 dark:border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                     <Box size={16} className="text-coffee/30 dark:text-warm-text/30" />
                     <select 
                        value={googleModelName}
                        onChange={(e) => setGoogleModelName(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-sm text-coffee dark:text-warm-text cursor-pointer [&>option]:text-black [&>option]:bg-white"
                     >
                        <option value="gemini-2.5-flash-image">Flash 2.5 (快速/免費)</option>
                        <option value="gemini-2.0-flash-exp">Flash 2.0 (實驗版)</option>
                        <option value="gemini-3-pro-image-preview">Pro 3 (高畫質/付費)</option>
                     </select>
                  </div>
                  <p className="text-[10px] text-coffee/50 dark:text-warm-text/50 px-1">
                    * 推薦使用 Flash 2.5 以獲得最佳速度與免費額度。
                  </p>
               </div>
            </div>
          )}

          {/* Custom Settings */}
          {provider === 'custom' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                   <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-relaxed">
                     適用於支援 <strong>OpenAI Chat API</strong> 格式的服務 (如 OpenRouter, DeepSeek, LocalAI)。模型必須具備 Vision 能力。
                   </p>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-coffee/60 dark:text-warm-text/60 uppercase tracking-wider flex items-center gap-1">
                      <Globe size={12} /> Base URL
                   </label>
                   <input 
                      type="text"
                      value={customConfig.baseUrl}
                      onChange={(e) => setCustomConfig('baseUrl', e.target.value)}
                      placeholder="https://openrouter.ai/api/v1"
                      className="w-full bg-white dark:bg-obsidian border border-coffee/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-coffee dark:text-warm-text font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-coffee/60 dark:text-warm-text/60 uppercase tracking-wider flex items-center gap-1">
                      <Key size={12} /> API Key
                   </label>
                   <div className="relative">
                      <input 
                         type={showApiKey ? "text" : "password"}
                         value={customConfig.apiKey}
                         onChange={(e) => setCustomConfig('apiKey', e.target.value)}
                         placeholder="sk-..."
                         className="w-full bg-white dark:bg-obsidian border border-coffee/10 dark:border-white/10 rounded-xl px-3 py-2.5 pr-10 text-xs text-coffee dark:text-warm-text font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                      />
                      <button 
                         onClick={() => setShowApiKey(!showApiKey)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee/40 dark:text-warm-text/40 hover:text-coffee dark:hover:text-warm-text"
                      >
                         {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-coffee/60 dark:text-warm-text/60 uppercase tracking-wider flex items-center gap-1">
                      <Server size={12} /> Model ID
                   </label>
                   <input 
                      type="text"
                      value={customConfig.modelName}
                      onChange={(e) => setCustomConfig('modelName', e.target.value)}
                      placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                      className="w-full bg-white dark:bg-obsidian border border-coffee/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-coffee dark:text-warm-text font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                   />
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-sand/30 dark:bg-black/20 border-t border-coffee/5 dark:border-white/5">
           <button 
             onClick={onClose}
             className="w-full py-3 bg-gradient-to-r from-accent to-purple-600 hover:from-accent-glow hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <Check size={18} />
             <span>完成設定</span>
           </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // --- Provider Settings State ---
  const [provider, setProvider] = useState<ProviderType>('google');
  
  // Google State
  const [googleModelName, setGoogleModelName] = useState<string>('gemini-2.5-flash-image');
  const [googleApiKey, setGoogleApiKey] = useState<string>('');
  
  // Custom State
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    modelName: 'anthropic/claude-3.5-sonnet'
  });

  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // App Logic State
  const [userImage, setUserImage] = useState<ImageFile | null>(null);
  const [garmentImage, setGarmentImage] = useState<ImageFile | null>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [resultData, setResultData] = useState<VTONResult | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resultSectionRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef<boolean>(false);

  // Initialization
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setGoogleApiKey(savedKey);

    const savedProvider = localStorage.getItem('doppl_provider');
    if (savedProvider === 'custom' || savedProvider === 'google') {
      setProvider(savedProvider as ProviderType);
    }

    const savedCustom = localStorage.getItem('doppl_custom_config');
    if (savedCustom) {
      try {
        setCustomConfig(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Failed to parse saved custom config");
      }
    }
    
    // Auto-open settings if no key found on first load
    if (!savedKey && !localStorage.getItem('gemini_api_key')) {
       // Small delay for UX
       setTimeout(() => setIsSettingsOpen(true), 800);
    }
  }, []);

  // Handlers
  const handleGoogleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value.trim();
    setGoogleApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };

  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider);
    localStorage.setItem('doppl_provider', newProvider);
  };

  const handleCustomConfigChange = (key: keyof CustomConfig, value: string) => {
    const newConfig = { ...customConfig, [key]: value };
    setCustomConfig(newConfig);
    localStorage.setItem('doppl_custom_config', JSON.stringify(newConfig));
  };

  const handleImageUpload = async (file: File, type: 'user' | 'garment') => {
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      const imageFile: ImageFile = {
        file,
        previewUrl,
        base64,
        mimeType: file.type
      };
      if (type === 'user') setUserImage(imageFile);
      else setGarmentImage(imageFile);
      setErrorMsg(null);
    } catch (err) {
      console.error("File processing error", err);
      setErrorMsg("圖片處理失敗，請嘗試其他檔案。");
    }
  };

  const simulatePhases = async () => {
    if (!isGeneratingRef.current) return;
    setStatus(AppStatus.ANALYZING);
    await new Promise(r => setTimeout(r, 2000));
    
    if (!isGeneratingRef.current) return;
    setStatus(AppStatus.WARPING);
    await new Promise(r => setTimeout(r, 2500));
    
    if (!isGeneratingRef.current) return;
    setStatus(AppStatus.COMPOSITING);
    await new Promise(r => setTimeout(r, 2000));
    
    if (!isGeneratingRef.current) return;
    setStatus(AppStatus.RENDERING);
  };

  const handleGenerate = async () => {
    // Validation
    if (provider === 'google' && !googleApiKey) {
      setIsSettingsOpen(true);
      setErrorMsg("請先設定 Google API Key。");
      return;
    }
    if (provider === 'custom') {
      if (!customConfig.baseUrl || !customConfig.apiKey || !customConfig.modelName) {
        setIsSettingsOpen(true);
        setErrorMsg("請完整填寫自定義 API 設定。");
        return;
      }
    }
    
    if (!userImage || !garmentImage) return;
    
    setErrorMsg(null);
    isGeneratingRef.current = true;

    const phasesPromise = simulatePhases();
    
    const generationPromise = generateVTON(
      provider,
      googleApiKey,
      googleModelName,
      customConfig,
      promptText,
      userImage.base64,
      userImage.mimeType,
      garmentImage.base64,
      garmentImage.mimeType
    );

    try {
      const [_, result] = await Promise.all([phasesPromise, generationPromise]);
      
      if (isGeneratingRef.current) {
        setResultData(result);
        setStatus(AppStatus.COMPLETE);
        setTimeout(() => {
          resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    } catch (error: any) {
      console.error("Generation failed", error);
      isGeneratingRef.current = false;
      setStatus(AppStatus.ERROR);
      if (error.message) {
         setErrorMsg(error.message);
      } else {
         setErrorMsg("生成失敗。請檢查設定或網路連線。");
      }
    } finally {
      isGeneratingRef.current = false;
    }
  };

  const handleCloseResult = () => {
    setResultData(null);
    setStatus(AppStatus.IDLE);
  };

  const fullReset = () => {
    setResultData(null);
    setUserImage(null);
    setGarmentImage(null);
    setPromptText('');
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
    isGeneratingRef.current = false;
  };

  const isProcessing = status !== AppStatus.IDLE && status !== AppStatus.COMPLETE && status !== AppStatus.ERROR;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        setProvider={handleProviderChange}
        googleApiKey={googleApiKey}
        setGoogleApiKey={handleGoogleKeyChange}
        googleModelName={googleModelName}
        setGoogleModelName={setGoogleModelName}
        customConfig={customConfig}
        setCustomConfig={handleCustomConfigChange}
      />

      <div className="min-h-screen transition-colors duration-500 bg-paper text-coffee dark:bg-obsidian dark:text-warm-text font-sans selection:bg-accent/30 selection:text-coffee dark:selection:text-warm-text pb-20">
        <ProcessingOverlay status={status} />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-paper/80 dark:bg-obsidian/80 backdrop-blur-md border-b border-coffee/5 dark:border-white/5 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-coffee dark:text-white">Doppl-Next</span>
            </div>
            
            <div className="flex items-center gap-3">
               {/* Current Model Label (Optional, showing active config) */}
               <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-coffee/40 dark:text-warm-text/40 bg-coffee/5 dark:bg-white/5 px-2 py-1 rounded-md">
                  <div className={`w-1.5 h-1.5 rounded-full ${provider === 'google' && googleApiKey ? 'bg-green-500' : provider === 'custom' && customConfig.apiKey ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                  {provider === 'google' ? 'Gemini' : 'Custom'}
               </div>

               <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-coffee/5 dark:bg-white/5 hover:bg-coffee/10 dark:hover:bg-white/10 text-coffee dark:text-warm-text/80 transition-colors border border-transparent hover:border-coffee/10 dark:hover:border-white/10"
                  title="設定"
               >
                  <Settings size={16} />
                  <span className="text-xs font-medium hidden sm:inline">Settings</span>
               </button>

               <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-coffee/5 dark:hover:bg-white/10 transition-colors text-coffee dark:text-warm-text/80 active:scale-90"
                  title={darkMode ? "切換亮色模式" : "切換暗色模式"}
               >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
               </button>
            </div>
          </div>
        </header>

        <main className="pt-24 px-4 md:px-6 max-w-7xl mx-auto flex flex-col items-center">
          
          {!resultData && (
            <div className="text-center space-y-4 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-coffee dark:text-white tracking-tight leading-tight">
                Gemini 3 Pro <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">真實物理 VTON 引擎</span>
              </h1>
              <p className="text-coffee/70 dark:text-warm-text/70 text-base md:text-lg leading-relaxed px-4">
                上傳照片與服裝。利用高階物理模擬與 <span className="text-coffee dark:text-white font-medium">Phantom Haptics</span> 觸感分析技術，合成 8K 級的攝影擬真試穿效果。
              </p>
            </div>
          )}

          {resultData && (
            <div ref={resultSectionRef} className="w-full flex justify-center mb-8">
               <ResultView result={resultData} onClose={handleCloseResult} />
            </div>
          )}

          <div className="w-full max-w-4xl space-y-8">
            
            {/* Workspace Card */}
            <div className="bg-sand/60 dark:bg-charcoal/30 border border-coffee/5 dark:border-white/5 rounded-3xl p-5 md:p-8 backdrop-blur-sm shadow-xl dark:shadow-none transition-colors duration-500">
              
              {/* Error Message Display */}
              {errorMsg && (
                <div className="w-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-200 p-4 rounded-xl flex items-start gap-3 mb-8 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <p className="text-sm whitespace-pre-line leading-relaxed font-medium">{errorMsg}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-8 relative">
                <ImageUploadCard
                  id="user-upload"
                  label="目標使用者"
                  subLabel="全身或半身照片"
                  image={userImage}
                  onUpload={(f) => handleImageUpload(f, 'user')}
                  onRemove={() => setUserImage(null)}
                  disabled={isProcessing}
                  className="w-full md:flex-1 min-w-0"
                />

                {/* Mobile Connector */}
                <div className="md:hidden flex justify-center -my-4 z-10 pointer-events-none">
                   <div className="p-2 rounded-full bg-paper dark:bg-obsidian border border-coffee/10 dark:border-white/10 shadow-lg text-coffee/30 dark:text-warm-text/30">
                     <Settings size={16} className="rotate-90 opacity-0" /> {/* Spacer */}
                   </div>
                </div>

                {/* Desktop Connector */}
                <div className="hidden md:flex flex-col justify-center items-center text-coffee/30 dark:text-warm-text/30 px-2 shrink-0">
                  <div className="h-full w-px bg-gradient-to-b from-transparent via-coffee/10 dark:via-white/10 to-transparent absolute"></div>
                  <div className="p-3 border border-coffee/10 dark:border-white/10 rounded-full bg-paper dark:bg-obsidian z-10 shadow-xl transition-colors duration-500">
                    {isProcessing ? (
                       <RefreshCw size={16} className="text-accent animate-spin" />
                    ) : (
                       <div className="flex gap-2">
                         <User size={16} className="text-coffee/40 dark:text-warm-text/40" />
                         <Shirt size={16} className="text-coffee/40 dark:text-warm-text/40" />
                       </div>
                    )}
                  </div>
                </div>

                <ImageUploadCard
                  id="garment-upload"
                  label="目標服飾"
                  subLabel="平拍或模特兒照片"
                  image={garmentImage}
                  onUpload={(f) => handleImageUpload(f, 'garment')}
                  onRemove={() => setGarmentImage(null)}
                  disabled={isProcessing}
                  className="w-full md:flex-1 min-w-0"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="prompt-input" className="flex items-center gap-2 text-sm font-medium text-coffee/80 dark:text-warm-text/80 ml-1">
                  <MessageSquare size={16} className="text-accent" />
                  {resultData ? '微調需求 / 追加指令' : '詳細微調需求 (選填)'}
                </label>
                <textarea
                  id="prompt-input"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={resultData 
                    ? "例如：請把褲子改短一點、讓光線亮一點，或試著把衣服紮進去... (直接輸入新指令，點擊下方重新生成)" 
                    : "例如：請保留我的手錶，並讓衣服看起來更寬鬆一點..."}
                  className="w-full h-24 bg-white dark:bg-charcoal border border-coffee/10 dark:border-white/10 rounded-xl p-4 text-sm text-coffee dark:text-warm-text placeholder-coffee/40 dark:placeholder-warm-text/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none shadow-sm dark:shadow-none"
                  disabled={isProcessing}
                />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {resultData && (
                  <button
                    onClick={fullReset}
                    className="px-6 py-4 rounded-xl border border-coffee/10 dark:border-white/10 bg-white dark:bg-white/5 text-coffee/70 dark:text-warm-text/70 font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                    disabled={isProcessing}
                  >
                    <Trash2 size={18} />
                    <span className="sm:hidden md:inline">重來</span>
                  </button>
                )}
                
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !userImage || !garmentImage}
                  className={`
                    flex-1 py-4 rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-accent/20
                    transition-all duration-300 active:scale-95
                    ${(isProcessing || !userImage || !garmentImage)
                      ? 'bg-gray-200 dark:bg-charcoal/50 text-gray-400 dark:text-white/30 cursor-not-allowed border border-transparent dark:border-white/5' 
                      : 'bg-gradient-to-r from-accent to-purple-600 hover:from-accent-glow hover:to-purple-500 text-white border border-transparent dark:border-white/10 hover:shadow-accent/40'}
                  `}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      <span>PROCESSING...</span>
                    </>
                  ) : resultData ? (
                    <>
                      <Sparkles size={20} />
                      <span>依據新設定重新生成</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>
                         {provider === 'google' && !googleApiKey ? '設定 Key 並啟動' : '啟動 VTON 引擎'}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;