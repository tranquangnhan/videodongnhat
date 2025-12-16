import React, { useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { db, firebaseConfig } from '../services/firebase';
import { UserPlus, X, Shield, CheckCircle } from 'lucide-react';

interface AdminToolsProps {
  onClose: () => void;
}

const AdminTools: React.FC<AdminToolsProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    let secondaryApp;
    
    try {
      // 1. Initialize a secondary app to create user without logging out the current admin
      // This is a client-side workaround since we don't have a backend Admin SDK here.
      secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user in Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      // 3. Write user role to Realtime Database using the MAIN app (which is authenticated as Admin)
      // Note: Database rules should allow write if auth.uid is an admin
      await set(ref(db, 'users/' + newUser.uid), {
        email: email,
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now()
      });

      // 4. Sign out the secondary auth so it doesn't interfere
      await signOut(secondaryAuth);

      setMessage(`Success! Created user ${email}`);
      setEmail('');
      setPassword('');
      setIsAdmin(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create user.");
    } finally {
      // 5. Clean up secondary app
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center space-x-2 text-blue-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold">Admin Panel</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-medium text-white mb-4">Create New Account</h4>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="flex items-center space-x-3 py-2">
              <div 
                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isAdmin ? 'bg-blue-600' : 'bg-slate-700'}`}
                onClick={() => setIsAdmin(!isAdmin)}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isAdmin ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-slate-300">Grant Admin Privileges</span>
            </div>

            {error && (
              <div className="bg-red-900/20 text-red-400 text-xs p-3 rounded border border-red-900/50">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-900/20 text-emerald-400 text-xs p-3 rounded border border-emerald-900/50 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                {message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminTools;
