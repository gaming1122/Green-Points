
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserPortalViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const ImpactStat: React.FC<{label: string; value: string; icon: string; color: string; isLight: boolean}> = ({label, value, icon, color, isLight}) => (
  <div className={`p-6 md:p-8 rounded-[2rem] border transition-all duration-500 group hover:scale-[1.02] ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5'}`}>
    <div className="flex items-center space-x-4 md:space-x-6">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl ${color} bg-white/5 shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 truncate">{label}</p>
        <p className={`text-xl md:text-2xl font-black tracking-tighter truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{value}</p>
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
  
  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // REMOTE SYNC LOGIC
  const startScanner = async () => {
    setShowScanner(true);
    setSyncStatus('SCANNING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScannerActive(true);
      }
      
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const detectFrame = async () => {
          if (!videoRef.current || !scannerActive) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              if (rawValue.startsWith('GP-SESS-')) {
                handleSync(rawValue);
                return;
              }
            }
            requestAnimationFrame(detectFrame);
          } catch (e) {
            console.error(e);
          }
        };
        detectFrame();
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setSyncStatus('ERROR');
      setError("CAMERA_ERROR: Access Denied");
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScannerActive(false);
    setShowScanner(false);
  };

  const handleSync = (sessionId: string) => {
    setSyncStatus('SUCCESS');
    localStorage.setItem(`gp_sync_${sessionId}`, JSON.stringify(user));
    setTimeout(() => {
      stopScanner();
      setSyncStatus('IDLE');
    }, 2000);
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
      
      {/* ACTION HEADER: Responsive Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4 mb-4 lg:absolute lg:top-0 lg:right-0 lg:z-20">
        <button 
          onClick={startScanner}
          className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 shadow-xl md:shadow-2xl active:scale-95 group ${
            isLight ? 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
          }`}
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-indigo-500/10 flex items-center justify-center text-xs md:text-sm text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
             <i className="fas fa-expand"></i>
          </div>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Remote Sync</span>
        </button>

        <button 
          onClick={() => setShowQrModal(true)}
          className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 shadow-xl md:shadow-2xl active:scale-95 group ${
            isLight ? 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50' : 'bg-[#0f1115] border-white/5 text-white hover:bg-white/5'
          }`}
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center text-xs md:text-sm text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
             <i className="fas fa-qrcode"></i>
          </div>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Identity QR</span>
        </button>
      </div>

      {/* REMOTE SYNC SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className={`w-full max-w-md rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl overflow-hidden relative ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1115] border-white/10'}`}>
              <button onClick={stopScanner} className="absolute top-6 right-6 md:top-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-rose-500 transition-all">
                <i className="fas fa-times"></i>
              </button>

              <div className="p-8 md:p-12 text-center">
                 <div className="mb-6 md:mb-8">
                   <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-2">Sync Terminal</h3>
                   <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Point camera at Login QR</p>
                 </div>

                 <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-black border-4 border-emerald-500/20 shadow-2xl">
                    {syncStatus === 'SUCCESS' ? (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-500 text-slate-900 animate-in zoom-in-95">
                         <i className="fas fa-check-circle text-5xl md:text-7xl mb-4"></i>
                         <p className="font-black uppercase tracking-[0.2em] text-xs md:text-sm">Identity Linked</p>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-32 h-32 md:w-48 md:h-48 border-2 border-emerald-500/50 rounded-[1.5rem] md:rounded-[2rem] relative">
                              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-scan-line shadow-[0_0_15px_#10b981]"></div>
                           </div>
                        </div>
                      </>
                    )}
                 </div>

                 <div className="mt-8 md:mt-10 p-5 md:p-6 bg-white/5 rounded-[1.5rem] md:rounded-3xl border border-white/5">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">
                       {syncStatus === 'SCANNING' ? 'SEARCHING FOR PAYLOAD...' : 'PROTOCOL READY'}
                    </p>
                    <p className="text-[7px] md:text-[8px] font-bold text-emerald-500 uppercase tracking-widest mono">SECURE_SYNC_v4.2</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* QR MODAL / IDENTITY GATEWAY */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className={`w-full max-w-md rounded-[2.5rem] md:rounded-[3.5rem] border shadow-[0_0_100px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 duration-500 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1115] border-white/10'}`}>
              <div className="p-8 md:p-10 text-center relative">
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>

                {!qrUnlocked ? (
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl md:text-2xl mx-auto shadow-inner">
                        <i className="fas fa-shield-halved"></i>
                      </div>
                      <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>Verify Identity</h3>
                      <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authorized Personnel Only</p>
                    </div>

                    <div className="space-y-5 md:space-y-6">
                      <div className="relative group text-left">
                        <label className="block text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3 ml-4">Security PIN</label>
                        <input 
                          type="password" 
                          placeholder="••••"
                          value={passwordAttempt}
                          onChange={e => {setPasswordAttempt(e.target.value); setError('');}}
                          className={`w-full border rounded-[1.2rem] md:rounded-2xl py-4 md:py-6 px-6 text-center text-xl md:text-2xl outline-none transition-all font-black tracking-[0.4em] md:tracking-[0.6em] ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-black/40 border-white/5 text-white focus:border-emerald-500/50 shadow-inner'}`}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
                          const record = db[user.role]?.[user.id];
                          if (record && record.password === passwordAttempt) setQrUnlocked(true);
                          else setError('ACCESS_DENIED');
                        }}
                        className="w-full py-4 md:py-6 bg-emerald-500 text-slate-900 rounded-[1.5rem] md:rounded-[2rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                      >
                        Unlock Scanner
                      </button>
                      {error && <p className="text-rose-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest animate-shake">Incorrect PIN. Try again.</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="space-y-2">
                       <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>Mobile Sync Hub</h3>
                       <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scan for node identification</p>
                    </div>

                    <div className={`w-full aspect-square max-w-[220px] md:max-w-[260px] p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] mx-auto relative overflow-hidden shadow-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#05070a] border-white/5'}`}>
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 md:space-y-6 text-emerald-500">
                          <i className="fas fa-qrcode text-6xl md:text-8xl drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"></i>
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Ready to Pair</p>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 animate-scan-line shadow-[0_0_20px_#10b981]"></div>
                    </div>

                    <div className={`p-4 md:p-6 rounded-[1.2rem] md:rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Node ID</p>
                      <p className={`text-xs md:text-sm font-bold mono truncate ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>{user.id.toUpperCase()}</p>
                    </div>

                    <button 
                      onClick={() => {setQrUnlocked(false); setPasswordAttempt('');}}
                      className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors"
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
        <div className="bg-emerald-600 text-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 shadow-[0_20px_60px_rgba(16,185,129,0.4)] animate-in slide-in-from-top-10 duration-700 border-4 border-white/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8 relative z-10 text-center sm:text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] bg-black/20 flex items-center justify-center text-3xl md:text-4xl shadow-inner border border-white/10 shrink-0">
              <i className="fas fa-bullhorn animate-bounce text-xl md:text-3xl"></i>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 md:gap-3 mb-2">
                 <span className="px-2 py-0.5 md:px-3 md:py-1 bg-black/20 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]">Priority Alpha</span>
                 <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Network Dispatch</h4>
              </div>
              <p className="font-bold text-sm md:text-lg leading-relaxed max-w-3xl opacity-90">{user.notice}</p>
            </div>
          </div>
          <button 
            onClick={clearNotice} 
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-emerald-700 font-black uppercase text-[9px] md:text-[11px] tracking-widest rounded-[1.2rem] md:rounded-3xl hover:bg-emerald-50 transition-all shadow-2xl active:scale-95 relative z-10"
          >
            Acknowledge Message
          </button>
        </div>
      )}

      {/* Profile Metrics Hub */}
      <div className="w-full">
        <div className={`p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border relative overflow-hidden shadow-2xl transition-all duration-500 ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className={`absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[100px] md:blur-[160px] transition-all duration-1000 ${pulse ? 'bg-emerald-500/20 scale-125' : 'bg-emerald-500/5'}`}></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 md:gap-12 lg:gap-24 relative z-10">
            <div className="relative group shrink-0">
              <div className={`absolute inset-0 rounded-[2.5rem] md:rounded-[4rem] blur-2xl transition-all duration-500 ${pulse ? 'bg-emerald-500/30 scale-110' : 'bg-emerald-500/10'}`}></div>
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                className={`w-36 h-36 md:w-52 md:h-52 lg:w-72 lg:h-72 rounded-[2.5rem] md:rounded-[4rem] border-4 relative z-10 object-cover transition-all duration-700 shadow-2xl ${isLight ? 'bg-slate-50 border-white' : 'bg-[#05070a] border-white/10'}`} 
                alt="Identity"
              />
            </div>
            
            <div className="flex-1 text-center lg:text-left w-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 mb-6 md:mb-10">
                <span className={`px-4 md:px-8 py-2 md:py-3 ${rank.bg} ${rank.color} border ${rank.border} rounded-full text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] flex items-center shadow-lg`}>
                  <i className="fas fa-shield mr-2 md:mr-3 text-xs md:text-sm"></i> {rank.title}
                </span>
                <div className={`flex items-center space-x-2 md:space-x-4 px-4 md:px-8 py-2 md:py-3 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-500 text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]`}></div>
                  <span className="truncate">Verified Node Status</span>
                </div>
              </div>
              
              <h2 className={`text-4xl md:text-6xl xl:text-8xl xl:text-9xl font-black tracking-tighter mb-6 md:mb-12 leading-none truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.name}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                <div className={`p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border transition-all duration-700 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5 shadow-inner'}`}>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 md:mb-4">Total XP Hub</p>
                  <p className={`text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mono leading-none ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>{user.points.toLocaleString()}</p>
                </div>
                <div className={`p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border transition-all duration-700 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5 shadow-inner'}`}>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 md:mb-4">Recycled PET</p>
                  <p className={`text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mono leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.bottles.toLocaleString()}</p>
                </div>
                <div className={`hidden lg:flex flex-col justify-center p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-dashed ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-white/5'}`}>
                   <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 italic">Node Uptime: 99.9%</p>
                   <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Global Rank: #142</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Matrix Grid */}
      <div className={`p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border shadow-2xl transition-all duration-500 ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 md:mb-16 gap-4">
            <h3 className={`text-2xl md:text-3xl font-black tracking-tighter uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <i className="fas fa-dna mr-4 md:mr-5 text-emerald-500 text-xl md:text-2xl"></i> Environmental Matrix
            </h3>
            <div className="hidden md:block h-[2px] flex-1 bg-white/5 mx-10"></div>
            <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Impact Flux</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <ImpactStat label="Carbon Offset" value={`${(user.bottles * 0.08).toFixed(2)} KG`} icon="fa-leaf" color="text-emerald-400" isLight={isLight} />
            <ImpactStat label="Network Standing" value={rank.title} icon="fa-star" color="text-amber-400" isLight={isLight} />
            <ImpactStat label="Energy Potential" value={`${user.points.toLocaleString()} XP`} icon="fa-bolt-lightning" color="text-indigo-400" isLight={isLight} />
          </div>
      </div>
    </div>
  );
};

export default UserPortalView;
