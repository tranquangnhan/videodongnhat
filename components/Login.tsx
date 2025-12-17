import React, { useState } from 'react';
import { ref, get, push, set } from 'firebase/database';
import { db } from '../services/firebase';
import { LogIn, AlertCircle, ShieldCheck, UserPlus, Fingerprint, User } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const usersRef = ref(db, 'users');
      // Fetch all users to filter client-side (avoids needing .indexOn rule)
      const snapshot = await get(usersRef);
      
      let foundUser: UserProfile | null = null;
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const userData = child.val() as UserProfile;
          if (userData.email === email) {
            foundUser = userData;
          }
        });
      }

      if (isRegistering) {
        // --- REGISTER FLOW ---
        
        if (foundUser) {
          throw new Error("Email này đã được sử dụng.");
        }

        if (password.length < 6) {
          throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        }

        // Create new user object
        const newUserRef = push(usersRef);
        const newUser: UserProfile = {
          id: newUserRef.key as string,
          email: email,
          password: password, // Note: In production, use hashing!
          name: name,
          role: 0, // Default to 0 (Pending/Inactive)
          createdAt: Date.now()
        };

        // Save to DB
        await set(newUserRef, newUser);
        
        // Auto login
        localStorage.setItem('veo_user', JSON.stringify(newUser));
        onLoginSuccess(newUser);

      } else {
        // --- LOGIN FLOW ---
        
        if (!foundUser) {
          throw new Error("Email hoặc mật khẩu không đúng.");
        }

        if (foundUser.password !== password) {
          throw new Error("Email hoặc mật khẩu không đúng.");
        }

        // Success
        localStorage.setItem('veo_user', JSON.stringify(foundUser));
        onLoginSuccess(foundUser);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${isRegistering ? 'bg-emerald-600 shadow-emerald-600/20 rotate-6' : 'bg-blue-600 shadow-blue-600/20 rotate-0'}`}>
              {isRegistering ? <UserPlus className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {isRegistering ? "Đăng Ký Tài Khoản" : "Đăng Nhập"}
          </h2>
          <p className="text-center text-slate-400 mb-8 text-sm">
            {isRegistering 
              ? "Tạo tài khoản để truy cập hệ thống" 
              : "Chào mừng quay trở lại hệ thống"}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Họ và Tên</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                  <User className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                  required
                />
                <Fingerprint className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-xs bg-red-950/30 p-3 rounded-lg border border-red-900/50 animate-in slide-in-from-left-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 transform active:scale-[0.98]
                ${isRegistering 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span>{isRegistering ? "Đăng Ký Ngay" : "Đăng Nhập"}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center mx-auto space-x-1.5 group"
            >
              <span>{isRegistering ? "Đã có tài khoản?" : "Chưa có tài khoản?"}</span>
              <span className={`font-semibold underline decoration-dotted underline-offset-4 group-hover:decoration-solid ${isRegistering ? 'text-blue-400' : 'text-emerald-400'}`}>
                {isRegistering ? "Đăng nhập" : "Đăng ký miễn phí"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;