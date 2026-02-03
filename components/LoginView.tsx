
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, Gender } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'QR' | 'ADMIN_LOGIN';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [gender, setGender] = useState<Gender>('MALE');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulated Session ID for QR Login
  const [sessionId] = useState(`GP-SESS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  useEffect(() => {
    if (mode === 'QR') {
      const interval = setInterval(() => {
        const syncData = localStorage.getItem(`gp_sync_${sessionId}`);
        if (syncData) {
          const user = JSON.parse(syncData);
          onLoginSuccess(user);
          localStorage.removeItem(`gp_sync_${sessionId}`);
          clearInterval(interval);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [mode, sessionId, onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const dbStr = localStorage.getItem('gp_database');
      const db = dbStr ? JSON.parse(dbStr) : { "ADMIN": {}, "USER": {}, "EMPLOYEE": {} };

      const inputId = id.trim();
      const inputPass = password.trim();

      // --- ADMIN ACCESS MODE ---
      if (mode === 'ADMIN_LOGIN') {
        // Hardcoded Super Admin Check
        if (inputId === '2251161030' && inputPass === 'rifat765') {
          const adminProfile: UserProfile = {
            id: '2251161030',
            name: 'Rifat Hassan (Admin)',
            role: 'ADMIN',
            gender: 'MALE',
            points: 0,
            bottles: 0,
            joinedAt: new Date().toISOString()
          };
          db.ADMIN[inputId] = { password: inputPass, profile: adminProfile };
          localStorage.setItem('gp_database', JSON.stringify(db));
          onLoginSuccess(adminProfile);
          return;
        }

        // Check Employees via Admin Portal
        const empRecord = db.EMPLOYEE[inputId.toLowerCase()] || db.EMPLOYEE[inputId];
        if (empRecord && empRecord.password === inputPass) {
          onLoginSuccess(empRecord.profile);
          return;
        }

        setError('Access Denied: Admin credentials invalid.');
        setLoading(false);
        return;
      }

      // --- STANDARD USER FLOW ---
      const studentId = inputId.toLowerCase();

      if (mode === 'SIGNUP') {
        if (db.USER[studentId] || db.ADMIN[studentId] || db.EMPLOYEE[studentId]) {
          setError(`Conflict: ID [${id}] already exists.`);
          setLoading(false);
          return;
        }
        const newUser: UserProfile = {
          id: studentId,
          name,
          role: 'USER',
          gender,
          points: 0,
          bottles: 0,
          joinedAt: new Date().toISOString()
        };
        db.USER[studentId] = { password: inputPass, profile: newUser };
        localStorage.setItem('gp_database', JSON.stringify(db));
        onLoginSuccess(newUser);
      } else {
        const userRecord = db.USER[studentId];
        if (userRecord && userRecord.password === inputPass) {
          onLoginSuccess(userRecord.profile);
        } else {
          setError('Authorization Failed: Student ID or Password incorrect.');
          setLoading(false);
        }
      }
    }, 800);
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setId('');
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#05070a] overflow-hidden">
      
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden bg-emerald-950/20">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[180px] bg-emerald-500/10"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[180px] bg-emerald-500/10"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl mb-10 border bg-emerald-500 text-slate-900 border-emerald-400/50">
            <i className="fas fa-leaf"></i>
          </div>
          <h1 className="text-6xl xl:text-7xl font-black text-white tracking-tighter leading-none mb-4">
            GREEN<br/>
            <span className="text-emerald-400">POINTS</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.4em] mono">
            IoT Plastic Recovery Interface
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mono">Secure Node Link Active</span>
          </div>
          <div className="h-[1px] w-full bg-white/5"></div>
          <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest mono">
            <span>Network: 5G/IoT Core</span>
            <span>Uptime: 99.9%</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto custom-scrollbar">
        
        {/* TOP RIGHT NAVIGATION */}
        <div className="absolute top-8 right-8 z-30 flex items-center space-x-3">
          
          {/* Signup/Login Toggle - Restored to Top Right */}
          {(mode === 'LOGIN' || mode === 'SIGNUP') && (
            <button 
              onClick={() => toggleMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
              {mode === 'LOGIN' ? 'Sign Up' : 'Sign In'}
            </button>
          )}

          {/* Admin Access Button - Only visible when QR Mode is ON as requested */}
          {mode === 'QR' && (
             <button 
               onClick={() => toggleMode('ADMIN_LOGIN')}
               className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600/20 transition-all active:scale-95 shadow-lg backdrop-blur-md animate-in slide-in-from-right-2"
             >
               Admin Access
             </button>
          )}

          {/* Back Button for Admin Login */}
          {mode === 'ADMIN_LOGIN' && (
            <button 
              onClick={() => toggleMode('LOGIN')}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
              User Login
            </button>
          )}

          {/* QR Toggle Button */}
          <button 
            onClick={() => toggleMode(mode === 'QR' ? 'LOGIN' : 'QR')}
            className={`px-4 py-3 border rounded-2xl transition-all active:scale-95 shadow-lg backdrop-blur-md ${mode === 'QR' ? 'bg-emerald-500 border-emerald-400 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}
            title={mode === 'QR' ? 'Keyboard Login' : 'QR Scan Login'}
          >
            <i className={`fas ${mode === 'QR' ? 'fa-keyboard' : 'fa-qrcode'} text-sm`}></i>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative min-h-screen">
          <div className="lg:hidden absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full blur-[120px] opacity-10 bg-emerald-500"></div>
          </div>

          <div className="w-full max-w-md bg-[#0f1115]/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none rounded-[3rem] p-8 sm:p-12 lg:p-0 border lg:border-none border-white/5 relative z-10 transition-all duration-500">
            
            <div className="text-center mb-10 lg:text-left">
              <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl mb-8 bg-emerald-500 text-slate-900">
                <i className="fas fa-leaf text-2xl"></i>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                {mode === 'ADMIN_LOGIN' ? 'Admin' : 'Student'} <span className={`${mode === 'ADMIN_LOGIN' ? 'text-indigo-400' : 'text-emerald-400'}`}>{mode === 'QR' ? 'Sync' : (mode === 'SIGNUP' ? 'Sign Up' : 'Access')}</span>
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mono opacity-70">
                {mode === 'QR' ? 'Scan to bypass manual entry' : mode === 'ADMIN_LOGIN' ? 'Secured Administrative Gateway' : 'Environment Node Access Protocol'}
              </p>
            </div>

            {mode === 'QR' ? (
              <div className="flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] relative group">
                  <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-[2.5rem] animate-pulse"></div>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionId}&color=05070a&margin=10`} 
                    alt="Session QR" 
                    className="w-48 h-48 relative z-10"
                  />
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-scan-line opacity-50"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white font-black uppercase tracking-widest text-xs">Waiting for device scan...</p>
                  <p className="text-slate-600 font-bold text-[9px] mono uppercase tracking-widest">SESS_ID: {sessionId}</p>
                </div>
                <div className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center space-x-4">
                  <i className="fas fa-info-circle text-emerald-500"></i>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Open GreenPoints on your phone and use the <strong>Scanner</strong> in Security Hub to log in instantly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'SIGNUP' && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500/50 text-white font-bold text-sm transition-all shadow-inner" required />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Gender</label>
                      <div className="flex space-x-3 bg-[#05070a] p-1.5 rounded-2xl border border-white/5">
                        <button type="button" onClick={() => setGender('MALE')} className={`flex-1 py-3.5 rounded-xl transition-all ${gender === 'MALE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'text-slate-700 border border-transparent'}`}>
                          <i className="fas fa-mars text-xl"></i>
                        </button>
                        <button type="button" onClick={() => setGender('FEMALE')} className={`flex-1 py-3.5 rounded-xl transition-all ${gender === 'FEMALE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/5' : 'text-slate-700 border border-transparent'}`}>
                          <i className="fas fa-venus text-xl"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">{mode === 'ADMIN_LOGIN' ? 'Admin ID' : 'Student ID'}</label>
                    <input type="text" value={id} onChange={e => setId(e.target.value)} placeholder={mode === 'ADMIN_LOGIN' ? 'Enter Admin Credentials' : 'Enter Student ID'} className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500/50 text-white font-bold text-sm transition-all tracking-wider uppercase shadow-inner" required />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500/50 text-white font-bold text-sm transition-all tracking-[0.5em] shadow-inner" required />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-5 rounded-[1.5rem] text-[10px] font-black uppercase text-center animate-shake">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full py-5 rounded-[1.5rem] font-black tracking-[0.25em] uppercase text-[12px] shadow-2xl active:scale-[0.98] transition-all mt-6 ${mode === 'ADMIN_LOGIN' ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-emerald-500/20'}`}
                >
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (mode === 'SIGNUP' ? 'Create Account' : (mode === 'ADMIN_LOGIN' ? 'Authorize Admin' : 'Verify Identity'))}
                </button>
              </form>
            )}
            
            <div className="mt-12 text-center lg:text-left">
              <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.4em] mono opacity-50">
                Identity Link Ready / Node Protocol Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
