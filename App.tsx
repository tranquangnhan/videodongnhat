import React, { useState } from 'react';
import { VeoProject, VideoStyle, AspectRatio, SceneCount } from './types';
import { generateSceneJson } from './services/geminiService';
import InputSection from './components/InputSection';
import JsonViewer from './components/JsonViewer';
import { Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [scriptInput, setScriptInput] = useState<string>('');
  const [generatedData, setGeneratedData] = useState<VeoProject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [sceneCount, setSceneCount] = useState<SceneCount>(1);

  const handleGenerate = async () => {
    if (!scriptInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateSceneJson(scriptInput, style, aspectRatio, sceneCount);
      setGeneratedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">Veo Converter</h1>
              <p className="text-xs text-blue-400 font-medium tracking-wide">AI VIDEO SCRIPT ANALYZER</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">v2.0.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Column: Input */}
          <div className="h-full min-h-[500px]">
            <InputSection
              value={scriptInput}
              onChange={setScriptInput}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              error={error}
              // Config Props
              style={style}
              onStyleChange={setStyle}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              sceneCount={sceneCount}
              onSceneCountChange={setSceneCount}
            />
          </div>

          {/* Right Column: Output */}
          <div className="h-full min-h-[500px]">
            <JsonViewer data={generatedData} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>Sản phẩm của Quang Nhân</p>
          <div className="mt-2 md:mt-0 flex space-x-4">
             <span>Strict JSON Array Schema</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;