import React, { useState, useEffect } from 'react';
import { VeoProject, VideoStyle, AspectRatio, SceneCount, UserProfile } from './types';
import { generateSceneJson } from './services/geminiService';
import InputSection from './components/InputSection';
import JsonViewer from './components/JsonViewer';
import Login from './components/Login';
import AdminTools from './components/AdminTools';
import { Terminal, LogOut, Shield, User as UserIcon, Settings, Lock } from 'lucide-react';

const App: React.FC = () => {
  // Auth State (Custom Realtime DB Auth)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdminTools, setShowAdminTools] = useState(false);

  // App State
  const [scriptInput, setScriptInput] = useState<string>('');
  const [generatedData, setGeneratedData] = useState<VeoProject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [sceneCount, setSceneCount] = useState<SceneCount>(1);

  // Auth Effect: Check LocalStorage on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('veo_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem('veo_user');
      }
    }
    setAuthLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('veo_user');
    setUser(null);
    setGeneratedData(null);
    setScriptInput('');
  };

  const handleGenerate = async () => {
    if (!scriptInput.trim()) return;

    // --- ROLE CHECK ---
    // Role 1 = Admin, Role 2 = Active User. Both allowed.
    // Role 0 = New/Pending. Not allowed.
    if (!user || user.role === 0) {
      setError("Tài khoản chưa được kích hoạt. Vui lòng liên hệ Admin để cấp quyền.");
      return;
    }
    
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

  // 1. Show Loading Screen while checking LocalStorage
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-mono animate-pulse">Checking session...</p>
      </div>
    );
  }

  // 2. Show Login Screen if not logged in
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Helper to get role label
  const getRoleLabel = (role: number) => {
    if (role === 1) return { label: 'Admin', color: 'text-emerald-400', icon: Shield };
    if (role === 2) return { label: 'Member', color: 'text-blue-400', icon: UserIcon };
    return { label: 'Pending', color: 'text-slate-400', icon: Lock };
  };

  const roleInfo = getRoleLabel(user.role);
  const RoleIcon = roleInfo.icon;

  // 3. Main App UI
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
          
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* User Info & Role Badge */}
            <div className="hidden sm:flex items-center space-x-3 bg-slate-900 py-1.5 px-3 rounded-full border border-slate-800">
              <div className={`flex items-center space-x-1.5 ${roleInfo.color}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{roleInfo.label}</span>
              </div>
              <div className="w-px h-3 bg-slate-700 mx-1"></div>
              <div className="flex flex-col items-end leading-none">
                 <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                 <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">{user.email}</span>
              </div>
            </div>

            {/* Admin Tools Button (Only if Role = 1) */}
            {user.role === 1 && (
              <button 
                onClick={() => setShowAdminTools(true)}
                className="hidden md:flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
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
          <div className="mt-2 md:mt-0 flex space-x-4 items-center">
             <span>Strict JSON Array Schema</span>
             {user.role === 1 && <span className="text-emerald-500 font-mono">[ADMIN MODE ACTIVE]</span>}
          </div>
        </div>
      </footer>

      {/* Admin Modal */}
      {showAdminTools && (
        <AdminTools onClose={() => setShowAdminTools(false)} />
      )}
    </div>
  );
};

export default App;