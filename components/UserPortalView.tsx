
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserPortalViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const UserPortalView: React.FC<UserPortalViewProps> = ({ user: initialUser, onUpdate }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(false);
  
  // Simulated Scanner State
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const clearNotice = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const updatedUser = { ...user, notice: undefined };
    if (db.USER[user.id]) {
      db.USER[user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    setUser(updatedUser);
    onUpdate(updatedUser);
  };

  const handleScanLogin = async () => {
    const sessId = prompt("Enter the Session ID from the Login Page QR Code:");
    if (!sessId) return;

    setIsScanning(true);
    setError('');

    setTimeout(() => {
      if (sessId.startsWith('GP-SESS-')) {
        localStorage.setItem(`gp_sync_${sessId}`, JSON.stringify(user));
        alert('Device Linked Successfully! The login page will now proceed.');
        setIsScanning(false);
      } else {
        setError('INVALID_SESSION_QR');
        setIsScanning(false);
      }
    }, 1500);
  };

  const currentRank = (pts: number) => {
    if (pts >= 1000) return { title: 'Eco Legend', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    if (pts >= 500) return { title: 'Green Guardian', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' };
    if (pts >= 250) return { title: 'Nature Scout', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    return { title: 'Eco Rookie', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
  };

  const rank = currentRank(user.points);
  const loginUrl = `${window.location.origin}${window.location.pathname}?loginId=${user.id}&role=USER`;
  const isLight = user.theme === 'LIGHT';

  return (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-6 duration-700 relative pb-20 w-full">
      
      {/* Notice Alert Box */}
      {user.notice && (
        <div className="bg-amber-500 text-slate-950 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-in slide-in-from-top-10 duration-500 border-4 border-white/20">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-3xl bg-black/10 flex items-center justify-center text-3xl animate-pulse">
              <i className="fas fa-comment-exclamation"></i>
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tighter mb-1">Administrative Message</h4>
              <p className="font-bold text-sm leading-relaxed max-w-2xl">{user.notice}</p>
            </div>
          </div>
          <button onClick={clearNotice} className="px-8 py-4 bg-black/10 hover:bg-black/20 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-black/5">Acknowledge</button>
        </div>
      )}

      {showXpPopup && (
        <div className="xp-popup pointer-events-none">
          <div className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-full font-black shadow-[0_0_50px_rgba(16,185,129,0.8)] flex flex-col items-center border-4 border-white/30 scale-110">
            <div className="flex items-center space-x-2">
              <i className="fas fa-bolt"></i>
              <span className="text-xl uppercase">+25 XP EARNED</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 items-start">
        <div className={`xl:col-span-3 2xl:col-span-4 p-6 md:p-10 xl:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border relative overflow-hidden shadow-2xl transition-all duration-500 h-full ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[140px] transition-all duration-1000 ${pulse ? 'bg-emerald-500/25 scale-125' : 'bg-emerald-500/5'}`}></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 relative z-10">
            <div className="relative group shrink-0">
              <div className={`absolute inset-0 rounded-[2.5rem] md:rounded-[3.5rem] blur-xl transition-all duration-500 ${pulse ? 'bg-emerald-500/30 scale-110' : 'bg-emerald-500/10'}`}></div>
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                className={`w-36 h-36 md:w-56 md:h-56 xl:w-60 xl:h-60 rounded-[2.5rem] md:rounded-[3rem] border-4 relative z-10 object-cover transition-all duration-700 shadow-2xl ${isLight ? 'bg-slate-50 border-white' : 'bg-[#05070a] border-white/10'}`} 
                alt="Profile"
              />
            </div>
            
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 xl:mb-8">
                <span className={`px-5 py-2 ${rank.bg} ${rank.color} border ${rank.border} rounded-full text-[10px] xl:text-[12px] font-black uppercase tracking-[0.15em] flex items-center shadow-md`}>
                  <i className="fas fa-trophy mr-2 text-xs"></i> {rank.title}
                </span>
                <div className={`flex items-center space-x-2 px-5 py-2 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-500 text-[10px] xl:text-[12px] font-black uppercase tracking-tighter shadow-md`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-emerald-500`}></div>
                  <span>NODE IDENTITY VERIFIED</span>
                </div>
              </div>
              
              <h2 className={`text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter mb-8 leading-none truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.name}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className={`p-6 md:p-10 rounded-[2rem] border transition-all duration-700 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5 shadow-2xl'}`}>
                  <p className="text-[10px] md:text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Sustainability XP</p>
                  <p className={`text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter mono leading-none ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>{user.points}</p>
                </div>
                <div className={`p-6 md:p-10 rounded-[2rem] border transition-all duration-700 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5 shadow-2xl'}`}>
                  <p className="text-[10px] md:text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Collected Units</p>
                  <p className={`text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter mono leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.bottles}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-8 p-8 rounded-[2rem] border relative z-10 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'}`}>
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <i className="fas fa-satellite-dish"></i>
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Network Connection</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase">Handshake active with GP-Core</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Last Sync</p>
                  <p className="text-xs font-bold text-slate-400 mono uppercase">{new Date().toLocaleTimeString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Security Hub Panel */}
        <div className={`xl:col-span-1 2xl:col-span-1 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col items-center text-center transition-all duration-500 h-full min-h-[450px] ${isLight ? 'bg-white border border-slate-100' : 'bg-[#0f1115] border border-white/5 glass'}`}>
           <div className="mb-6 w-full">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">SECURITY HUB</p>
             <div className="h-[2px] w-12 bg-emerald-500 mx-auto rounded-full"></div>
           </div>
           
           <div className="flex-1 w-full flex flex-col justify-center space-y-4">
             {!qrUnlocked ? (
               <div className="w-full space-y-6">
                  <div className={`p-6 rounded-[2rem] flex flex-col items-center space-y-6 shadow-inner ${isLight ? 'bg-slate-50' : 'bg-[#05070a]'}`}>
                    <div className="w-full">
                      <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">AUTH_ID PIN</label>
                      <input 
                        type="password" 
                        placeholder="••••"
                        value={passwordAttempt}
                        onChange={e => setPasswordAttempt(e.target.value)}
                        className={`w-full border rounded-xl py-4 px-4 text-center text-xl outline-none transition-all font-black tracking-[0.4em] ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-black/60 border-white/5 text-white focus:border-emerald-500/50'}`}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
                        if (db.USER[user.id]?.password === passwordAttempt) setQrUnlocked(true);
                        else setError('ACCESS_DENIED');
                      }}
                      className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 active:scale-95 transition-all shadow-lg"
                    >
                      UNLOCK IDENTITY
                    </button>
                    {error && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest animate-shake mt-2">{error}</p>}
                  </div>
               </div>
             ) : (
               <div className="space-y-6 animate-in zoom-in-95 duration-500">
                 <div className={`w-full aspect-square max-w-[200px] p-6 rounded-[2.5rem] mx-auto relative overflow-hidden shadow-2xl ${isLight ? 'bg-slate-50 border border-slate-100' : 'bg-[#05070a] border border-white/5'}`}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(loginUrl)}&bgcolor=${isLight ? 'f8fafc' : '05070a'}&color=10b981`} 
                      alt="Identity" 
                      className="w-full h-full relative z-10 p-1"
                    />
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-scan-line opacity-50"></div>
                 </div>
                 <button 
                  onClick={handleScanLogin}
                  disabled={isScanning}
                  className="w-full py-4 bg-white/5 border border-emerald-500/30 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all flex items-center justify-center space-x-2"
                >
                  <i className={`fas ${isScanning ? 'fa-spinner fa-spin' : 'fa-qrcode'}`}></i>
                  <span>{isScanning ? 'Syncing...' : 'Sync Device'}</span>
                </button>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className={`p-8 md:p-10 xl:p-12 rounded-[2.5rem] md:rounded-[3rem] border shadow-2xl transition-all duration-500 ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <h3 className={`text-xl md:text-2xl font-black mb-10 tracking-tighter uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <i className="fas fa-chart-line mr-4 text-emerald-500"></i> Performance Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <ImpactStat label="Carbon Reduction" value={`${(user.bottles * 0.08).toFixed(2)} KG`} icon="fa-leaf" color="text-emerald-400" isLight={isLight} />
            <ImpactStat label="Tier Standing" value={rank.title} icon="fa-medal" color="text-amber-400" isLight={isLight} />
            <ImpactStat label="Network Power" value={`${user.points.toLocaleString()} XP`} icon="fa-bolt-lightning" color="text-indigo-400" isLight={isLight} />
          </div>
      </div>
    </div>
  );
};

const ImpactStat: React.FC<{label: string; value: string; icon: string; color: string; isLight: boolean}> = ({label, value, icon, color, isLight}) => (
  <div className={`p-6 md:p-8 rounded-[2rem] border flex items-center space-x-6 group transition-all duration-500 ${isLight ? 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl' : 'bg-[#05070a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-2xl md:text-4xl ${color} transition-all duration-700 group-hover:scale-110`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 truncate">{label}</p>
      <p className={`text-xl md:text-3xl xl:text-4xl font-black tracking-tighter mono leading-none truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{value}</p>
    </div>
  </div>
);

export default UserPortalView;
