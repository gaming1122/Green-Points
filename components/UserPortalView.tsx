
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserPortalViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const ImpactStat: React.FC<{label: string; value: string; icon: string; color: string; isLight: boolean}> = ({label, value, icon, color, isLight}) => (
  <div className={`p-8 rounded-[2rem] border transition-all duration-500 group hover:scale-[1.02] ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5'}`}>
    <div className="flex items-center space-x-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color} bg-white/5 shadow-lg group-hover:scale-110 transition-transform`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  </div>
);

const UserPortalView: React.FC<UserPortalViewProps> = ({ user: initialUser, onUpdate }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const clearNotice = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const updatedUser = { ...user, notice: undefined };
    
    if (db[user.role] && db[user.role][user.id]) {
      db[user.role][user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    setUser(updatedUser);
    onUpdate(updatedUser);
  };

  const currentRank = (pts: number) => {
    if (pts >= 1000) return { title: 'Eco Legend', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    if (pts >= 500) return { title: 'Green Guardian', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' };
    if (pts >= 250) return { title: 'Nature Scout', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    return { title: 'Eco Rookie', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
  };

  const rank = currentRank(user.points);
  const isLight = user.theme === 'LIGHT';

  return (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-6 duration-700 relative pb-20 w-full max-w-[1600px] mx-auto">
      
      {/* ACTION HEADER: Top Right QR Button */}
      <div className="absolute top-0 right-0 z-20 flex items-center space-x-4">
        <button 
          onClick={() => setShowQrModal(true)}
          className={`group flex items-center space-x-3 px-6 py-4 rounded-[2rem] border transition-all duration-300 shadow-2xl active:scale-95 ${
            isLight ? 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50' : 'bg-[#0f1115] border-white/5 text-white hover:bg-white/5'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
             <i className="fas fa-qrcode"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Identity QR</span>
        </button>
      </div>

      {/* QR MODAL / IDENTITY GATEWAY */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className={`w-full max-w-md rounded-[3.5rem] border shadow-[0_0_100px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1115] border-white/10'}`}>
              <div className="p-10 text-center relative">
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>

                {!qrUnlocked ? (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
                        <i className="fas fa-shield-halved"></i>
                      </div>
                      <h3 className={`text-2xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>Verify Identity</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authorized Personnel Only</p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative group">
                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-4 text-left">Security PIN</label>
                        <input 
                          type="password" 
                          placeholder="••••"
                          value={passwordAttempt}
                          onChange={e => {setPasswordAttempt(e.target.value); setError('');}}
                          className={`w-full border rounded-2xl py-6 px-6 text-center text-2xl outline-none transition-all font-black tracking-[0.6em] ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-black/40 border-white/5 text-white focus:border-emerald-500/50 shadow-inner'}`}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
                          const record = db[user.role]?.[user.id];
                          if (record && record.password === passwordAttempt) setQrUnlocked(true);
                          else setError('ACCESS_DENIED');
                        }}
                        className="w-full py-6 bg-emerald-500 text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                      >
                        Unlock Scanner
                      </button>
                      {error && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest animate-shake">Incorrect PIN. Try again.</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="space-y-2">
                       <h3 className={`text-2xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>Mobile Sync Hub</h3>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scan for node identification</p>
                    </div>

                    <div className={`w-full aspect-square max-w-[260px] p-10 rounded-[4rem] mx-auto relative overflow-hidden shadow-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#05070a] border-white/5'}`}>
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-6 text-emerald-500">
                          <i className="fas fa-qrcode text-8xl drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"></i>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ready to Pair</p>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 animate-scan-line shadow-[0_0_20px_#10b981]"></div>
                    </div>

                    <div className={`p-6 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Authenticated Node ID</p>
                      <p className={`text-sm font-bold mono ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>{user.id.toUpperCase()}</p>
                    </div>

                    <button 
                      onClick={() => {setQrUnlocked(false); setPasswordAttempt('');}}
                      className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors"
                    >
                      Reset Gateway Access
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {user.notice && (
        <div className="bg-emerald-600 text-white p-8 md:p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_60px_rgba(16,185,129,0.4)] animate-in slide-in-from-top-10 duration-700 border-4 border-white/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="flex items-center space-x-8 relative z-10">
            <div className="w-20 h-20 rounded-[2.5rem] bg-black/20 flex items-center justify-center text-4xl shadow-inner border border-white/10">
              <i className="fas fa-bullhorn animate-bounce"></i>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                 <span className="px-3 py-1 bg-black/20 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">Priority Alpha</span>
                 <h4 className="text-2xl font-black uppercase tracking-tighter">Network Dispatch</h4>
              </div>
              <p className="font-bold text-lg leading-relaxed max-w-3xl opacity-90">{user.notice}</p>
            </div>
          </div>
          <button 
            onClick={clearNotice} 
            className="px-10 py-5 bg-white text-emerald-700 font-black uppercase text-[11px] tracking-widest rounded-3xl hover:bg-emerald-50 transition-all shadow-2xl active:scale-95 relative z-10"
          >
            Acknowledge Message
          </button>
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

      {/* Profile Metrics Hub - Spanning Full Width now for a more premium look */}
      <div className="w-full">
        <div className={`p-8 md:p-14 rounded-[4rem] border relative overflow-hidden shadow-2xl transition-all duration-500 ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] transition-all duration-1000 ${pulse ? 'bg-emerald-500/20 scale-125' : 'bg-emerald-500/5'}`}></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-24 relative z-10">
            <div className="relative group shrink-0">
              <div className={`absolute inset-0 rounded-[4rem] blur-2xl transition-all duration-500 ${pulse ? 'bg-emerald-500/30 scale-110' : 'bg-emerald-500/10'}`}></div>
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                className={`w-52 h-52 md:w-72 md:h-72 rounded-[4rem] border-4 relative z-10 object-cover transition-all duration-700 shadow-2xl ${isLight ? 'bg-slate-50 border-white' : 'bg-[#05070a] border-white/10'}`} 
                alt="Identity"
              />
            </div>
            
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                <span className={`px-8 py-3 ${rank.bg} ${rank.color} border ${rank.border} rounded-full text-[12px] font-black uppercase tracking-[0.2em] flex items-center shadow-lg`}>
                  <i className="fas fa-shield mr-3 text-sm"></i> {rank.title}
                </span>
                <div className={`flex items-center space-x-4 px-8 py-3 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-500 text-[12px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                  <div className={`w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]`}></div>
                  <span>Verified Node Status</span>
                </div>
              </div>
              
              <h2 className={`text-6xl md:text-8xl xl:text-9xl font-black tracking-tighter mb-12 leading-none truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.name}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className={`p-12 rounded-[3.5rem] border transition-all duration-700 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5 shadow-inner'}`}>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total XP Network Hub</p>
                  <p className={`text-5xl md:text-7xl font-black tracking-tighter mono leading-none ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>{user.points.toLocaleString()}</p>
                </div>
                <div className={`p-12 rounded-[3.5rem] border transition-all duration-700 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5 shadow-inner'}`}>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Units Recycled (PET)</p>
                  <p className={`text-5xl md:text-7xl font-black tracking-tighter mono leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.bottles.toLocaleString()}</p>
                </div>
                <div className={`hidden lg:flex flex-col justify-center p-12 rounded-[3.5rem] border border-dashed ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-white/5'}`}>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Node Uptime: 99.9%</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Global Rank: #142</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Matrix Grid */}
      <div className={`p-12 md:p-16 rounded-[4rem] border shadow-2xl transition-all duration-500 ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className="flex items-center justify-between mb-16">
            <h3 className={`text-3xl font-black tracking-tighter uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <i className="fas fa-dna mr-5 text-emerald-500"></i> Environmental Matrix
            </h3>
            <div className="hidden md:block h-[2px] flex-1 bg-white/5 mx-10"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Impact Flux</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <ImpactStat label="Carbon Offset" value={`${(user.bottles * 0.08).toFixed(2)} KG`} icon="fa-leaf" color="text-emerald-400" isLight={isLight} />
            <ImpactStat label="Network Standing" value={rank.title} icon="fa-star" color="text-amber-400" isLight={isLight} />
            <ImpactStat label="Energy Potential" value={`${user.points.toLocaleString()} XP`} icon="fa-bolt-lightning" color="text-indigo-400" isLight={isLight} />
          </div>
      </div>
    </div>
  );
};

export default UserPortalView;
