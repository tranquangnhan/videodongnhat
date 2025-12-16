import React, { useState, useEffect } from 'react';
import { Copy, Check, Code2, Download, Film, Clock, ChevronRight, Layers } from 'lucide-react';
import { VeoProject, VeoSceneJson } from '../types';

interface JsonViewerProps {
  data: VeoProject | null;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  // Reset selection when data changes
  useEffect(() => {
    if (data) setSelectedSceneIndex(0);
  }, [data]);

  const currentScene = data ? data[selectedSceneIndex] : null;

  const handleCopy = () => {
    if (!currentScene) return;
    navigator.clipboard.writeText(JSON.stringify(currentScene, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScene = () => {
    if (!currentScene) return;
    const project = currentScene.metadata.project_name.replace(/\s+/g, '_');
    const sceneNum = currentScene.metadata.scene_number;
    const blob = new Blob([JSON.stringify(currentScene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project}_${sceneNum}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadProject = () => {
    if (!data || data.length === 0) return;
    const project = data[0].metadata.project_name.replace(/\s+/g, '_');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VEO_PROJECT_${project}_FULL.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2 text-slate-200">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-lg">Timeline Editor</h2>
          </div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Waiting for Input</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/30">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
            <Film className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">No Scenes Generated Yet</p>
          <p className="text-xs mt-1 max-w-[250px] opacity-70">
            Enter your script and settings on the left to generate a scene-by-scene JSON timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2">
           <div className="bg-emerald-900/30 p-1.5 rounded-md">
             <Layers className="w-4 h-4 text-emerald-400" />
           </div>
           <div>
             <h2 className="font-semibold text-sm text-slate-200">{data[0].metadata.project_name}</h2>
             <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
               {data.length} Scenes Total
             </p>
           </div>
        </div>
        <button
          onClick={handleDownloadProject}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 transition-colors border border-slate-600"
        >
          <Download className="w-3 h-3" />
          <span>Download All</span>
        </button>
      </div>

      {/* Timeline Strip */}
      <div className="bg-[#0f1218] border-b border-slate-700 p-2 overflow-x-auto custom-scrollbar">
        <div className="flex space-x-2 min-w-max px-2">
          {data.map((scene, index) => {
            const isSelected = selectedSceneIndex === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedSceneIndex(index)}
                className={`group relative flex flex-col items-start w-32 p-2 rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                    {scene.metadata.scene_number.replace('SCENE_', 'SC_')}
                  </span>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                </div>
                
                <div className="w-full h-8 bg-slate-900/50 rounded border border-slate-800 mb-1.5 overflow-hidden relative">
                   {/* Mini generic visualization of shot type */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-20 text-[8px] uppercase font-mono">
                     {scene.metadata.shot_type.split('_')[0]}
                   </div>
                </div>

                <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{scene.metadata.timing.duration_seconds}s</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar for Selected Scene */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-blue-400 font-bold font-mono">
            {currentScene?.metadata.scene_number}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-300 font-medium truncate max-w-[200px]">
             {currentScene?.core_description.subject}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadScene}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            title="Download Scene JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all duration-200 border ${
              copied 
                ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Display Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0d1117]">
        <div className="absolute inset-0 overflow-auto custom-scrollbar">
          <pre className="p-4 text-xs sm:text-sm font-mono leading-relaxed">
            <code className="block text-slate-300">
              {currentScene && JSON.stringify(currentScene, (key, value) => {
                  return value; 
              }, 2).split('\n').map((line, i) => {
                  const isKey = /^\s*".*":/.test(line);
                  
                  if (isKey) {
                      const parts = line.split(':');
                      return (
                          <div key={i} className="hover:bg-slate-800/50 px-2 rounded-sm -mx-2">
                              <span className="text-sky-400">{parts[0]}:</span>
                              <span className="text-orange-300">{parts.slice(1).join(':')}</span>
                          </div>
                      );
                  }
                  return <div key={i} className="text-slate-400 hover:bg-slate-800/50 px-2 rounded-sm -mx-2">{line}</div>;
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
