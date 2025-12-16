import React from 'react';
import { FileText, Sparkles, AlertCircle, Settings2 } from 'lucide-react';
import { VideoStyle, AspectRatio, SceneCount } from '../types';

interface InputSectionProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
  // New props for configuration
  style: VideoStyle;
  onStyleChange: (val: VideoStyle) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (val: AspectRatio) => void;
  sceneCount: SceneCount;
  onSceneCountChange: (val: SceneCount) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  value, 
  onChange, 
  onGenerate, 
  isLoading,
  error,
  style, onStyleChange,
  aspectRatio, onAspectRatioChange,
  sceneCount, onSceneCountChange
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2 text-slate-200">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-lg">Input Script</h2>
        </div>
        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Vietnamese Source</span>
      </div>

      {/* Configuration Bar */}
      <div className="px-4 py-3 bg-slate-900/30 border-b border-slate-700 grid grid-cols-3 gap-3">
        
        {/* Style Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Style</label>
          <select 
            value={style}
            onChange={(e) => onStyleChange(e.target.value as VideoStyle)}
            className="bg-slate-800 text-xs sm:text-sm text-slate-200 border border-slate-600 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="single">Single Scene</option>
            <option value="animation">Animation (Hoạt hình)</option>
            <option value="cinematic">Cinematic (Điện ảnh)</option>
            <option value="tiktok">TikTok (Viral)</option>
          </select>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Aspect Ratio</label>
          <select 
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
            className="bg-slate-800 text-xs sm:text-sm text-slate-200 border border-slate-600 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="21:9">21:9 (Ultrawide)</option>
            <option value="4:3">4:3 (Classic)</option>
          </select>
        </div>

        {/* Duration/Scene Count Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Duration</label>
          <select 
            value={sceneCount}
            onChange={(e) => onSceneCountChange(Number(e.target.value) as SceneCount)}
            className="bg-slate-800 text-xs sm:text-sm text-slate-200 border border-slate-600 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value={1}>1 Scene (Var)</option>
            <option value={5}>5 Scenes (40s)</option>
            <option value={10}>10 Scenes (80s)</option>
            <option value={15}>15 Scenes (120s)</option>
          </select>
        </div>

      </div>

      <div className="flex-1 p-4 relative">
        <textarea
          className="w-full h-full bg-slate-900/50 text-slate-300 p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 placeholder-slate-600 font-mono text-sm leading-relaxed"
          placeholder="Paste your scene script here...
Example:
CẢNH 1: PHÒNG KHÁCH - NGÀY
Tùng (25 tuổi, mặc áo thun trắng, quần jeans xanh) ngồi thẫn thờ trên ghế sofa..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
        />
        
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-200 px-4 py-3 rounded-lg border border-red-700 flex items-center gap-2 text-sm shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-700">
        <button
          onClick={onGenerate}
          disabled={!value.trim() || isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all duration-200
            ${!value.trim() || isLoading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:transform active:scale-[0.98]'
            }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Script...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Scene JSON</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
