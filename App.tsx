import React, { useState, useEffect } from 'react';
import { VeoProject, VideoStyle, AspectRatio, SceneCount, UserProfile } from './types';
import { generateSceneJson } from './services/geminiService';
import InputSection from './components/InputSection';
import JsonViewer from './components/JsonViewer';
import Login from './components/Login';
import AdminTools from './components/AdminTools';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, get, child } from 'firebase/database';
import { Terminal, LogOut, Shield, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch User Role from Realtime Database
        try {
          const snapshot = await get(child(ref(db), `users/${currentUser.uid}`));
          if (snapshot.exists()) {
            setUserProfile(snapshot.val() as UserProfile);
          } else {
            // Fallback if no profile exists yet
            setUserProfile({ uid: currentUser.uid, email: currentUser.email || '', role: 'user', createdAt: Date.now() });
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

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
            {/* User Info & Admin Actions */}
            <div className="hidden sm:flex items-center space-x-3 bg-slate-900 py-1.5 px-3 rounded-full border border-slate-800">
              {userProfile?.role === 'admin' ? (
                 <Shield className="w-4 h-4 text-emerald-400" />
              ) : (
                 <UserIcon className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-mono text-slate-300">{user.email}</span>
            </div>

            {userProfile?.role === 'admin' && (
              <button 
                onClick={() => setShowAdminTools(true)}
                className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>Admin Tools</span>
              </button>
            )}

            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
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
          <div className="mt-2 md:mt-0 flex space-x-4">
             <span>Strict JSON Array Schema</span>
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
