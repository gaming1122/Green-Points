
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, Gender } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthContext = 'STUDENT' | 'ADMIN';
type AuthMode = 'LOGIN' | 'SIGNUP';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authContext, setAuthContext] = useState<AuthContext>('STUDENT');
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [gender, setGender] = useState<Gender>('MALE');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const newSessId = 'GP-SESS-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setSessionId(newSessId);

    const pollSync = setInterval(() => {
      const syncData = localStorage.getItem(`gp_sync_${newSessId}`);
      if (syncData) {
        try {
          const userProfile = JSON.parse(syncData);
          localStorage.removeItem(`gp_sync_${newSessId}`);
          onLoginSuccess(userProfile);
          clearInterval(pollSync);
        } catch (e) {
          console.error("QR Sync failed", e);
        }
      }
    }, 2000);

    return () => clearInterval(pollSync);
  }, [onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
      const inputId = id.trim().toLowerCase();
      const inputPass = password.trim();

      if (authContext === 'ADMIN') {
        if (inputId === '2251161030' && inputPass === 'rifat765') {
          const adminProfile: UserProfile = {
            id: '2251161030',
            name: 'Rifat Hassan (Admin)',
            role: 'ADMIN',
            gender: 'MALE',
            points: 0,
            bottles: 0,
            joinedAt: new Date().toISOString(),
            theme: 'DARK'
          };
          db.ADMIN[inputId] = { password: inputPass, profile: adminProfile };
          localStorage.setItem('gp_database', JSON.stringify(db));
          onLoginSuccess(adminProfile);
          return;
        }

        const empRecord = db.EMPLOYEE[inputId];
        if (empRecord && empRecord.password === inputPass) {
          onLoginSuccess(empRecord.profile);
          return;
        }
        
        setError('ACCESS_DENIED: Restricted Access.');
        setLoading(false);
        return;
      }

      if (mode === 'SIGNUP') {
        const newUser: UserProfile = {
          id: inputId,
          name,
          role: 'USER',
          gender,
          points: 0,
          bottles: 0,
          joinedAt: new Date().toISOString(),
          theme: 'DARK'
        };
        db.USER[inputId] = { password: inputPass, profile: newUser };
        localStorage.setItem('gp_database', JSON.stringify(db));
        onLoginSuccess(newUser);
      } else {
        const userRecord = db.USER[inputId];
        if (userRecord && userRecord.password === inputPass) {
          if (userRecord.profile.isBanned) {
            setError('LOCKED: Account Suspended.');
            setLoading(false);
            return;
          }
          onLoginSuccess(userRecord.profile);
        } else {
          setError('FAILED: Check ID & Password.');
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#05070a] overflow-hidden font-['Plus_Jakarta_Sans'] text-white">
      {/* Visual Side Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-20 relative overflow-hidden bg-emerald-950/10 border-r border-white/5">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] bg-emerald-500/10"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-12 border bg-emerald-500 text-slate-900 border-emerald-400/50">
            <i className="fas fa-leaf"></i>
          </div>
          <h1 className="text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6 uppercase">
            Green<br/>
            <span className="text-emerald-500">Points</span>
          </h1>
          <div className="h-1.5 w-24 bg-emerald-500 rounded-full mb-8"></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.5em] mono opacity-60">
            IoT Sustainability Node
          </p>
        </div>
        <div className="relative z-10 opacity-30">
           <p className="text-[10px] font-black uppercase tracking-widest">Version 2.7.0_STABLE</p>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto custom-scrollbar bg-[#05070a]">
        
        {/* Top-Right Action Row */}
        <div className="absolute top-8 right-8 z-50 flex items-center space-x-4">
          {authContext === 'STUDENT' && mode === 'LOGIN' && (
            <button 
              onClick={() => setShowQrModal(true)}
              className="flex items-center space-x-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
            >
              <i className="fas fa-qrcode text-sm"></i>
              <span>Quick Sync</span>
            </button>
          )}
          
          {authContext === 'ADMIN' && (
            <button 
              onClick={() => { setAuthContext('STUDENT'); setMode('LOGIN'); }}
              className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Student
            </button>
          )}
        </div>

        {/* QR MODAL */}
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#0f1115] w-full max-w-sm rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(16,185,129,0.1)] p-12 text-center relative overflow-hidden">
              <button 
                onClick={() => setShowQrModal(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Mobile Gateway</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scan with GreenPoints Mobile app</p>
                </div>

                <div className="relative group p-4 bg-white rounded-[2.5rem] shadow-2xl border-4 border-emerald-500/20 mx-auto w-fit">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionId}&bgcolor=ffffff&color=05070a`} 
                    alt="Quick Login QR" 
                    className="w-40 h-40 md:w-48 md:h-48" 
                  />
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/60 animate-scan-line shadow-[0_0_15px_#10b981]"></div>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mono animate-pulse">
                    Awaiting Handshake...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-8 sm:p-16">
          <div className="w-full max-w-md space-y-10">
            
            <div className="space-y-4">
              <div className={`inline-block px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] ${authContext === 'ADMIN' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                {authContext === 'ADMIN' ? 'Secure Terminal' : 'Global Identity'}
              </div>
              <div className="flex justify-between items-end">
                <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                  {mode === 'SIGNUP' ? 'Join' : 'Login'}
                </h2>
                {authContext === 'STUDENT' && (
                  <button 
                    onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-white transition-colors pb-1 border-b border-emerald-500/30"
                  >
                    {mode === 'LOGIN' ? 'Register Account' : 'Back to Sign In'}
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'SIGNUP' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="group">
                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-4">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-emerald-500/50" required />
                  </div>
                  <div className="group">
                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-4">Gender Modality</label>
                    <div className="flex gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                      <button type="button" onClick={() => setGender('MALE')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center text-xl ${gender === 'MALE' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                        <i className="fas fa-mars"></i>
                      </button>
                      <button type="button" onClick={() => setGender('FEMALE')} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center text-xl ${gender === 'FEMALE' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                        <i className="fas fa-venus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-4">Student ID</label>
                  <input type="text" value={id} onChange={e => setId(e.target.value)} placeholder="ID Code" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-emerald-500/50" required />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-4">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-[0.4em] outline-none focus:border-emerald-500/50" required />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase text-center rounded-2xl animate-shake tracking-widest">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${authContext === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-500 text-slate-900'}`}
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : (mode === 'SIGNUP' ? 'Create Node' : 'Initialize')}
              </button>
            </form>

            {/* FOOTER ACTION (Integrated Admin Entry) */}
            {mode === 'LOGIN' && authContext === 'STUDENT' && (
              <div className="pt-8 flex flex-col items-center animate-in fade-in duration-1000">
                <button 
                  onClick={() => { setAuthContext('ADMIN'); setError(''); }}
                  className="group flex items-center space-x-2 text-slate-700 hover:text-indigo-400 transition-colors py-2 px-6"
                >
                  <i className="fas fa-shield-halved text-[10px] opacity-40 group-hover:opacity-100"></i>
                  <span className="text-[9px] font-black uppercase tracking-widest">System Administration</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
