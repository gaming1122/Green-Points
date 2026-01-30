
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserPortalViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const UserPortalView: React.FC<UserPortalViewProps> = ({ user: initialUser, onUpdate }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [animating, setAnimating] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [error, setError] = useState('');
  
  // Bluetooth State
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [bleStatus, setBleStatus] = useState('Disconnected');
  const [pulse, setPulse] = useState(false);

  const handleReward = useCallback((count: number = 1) => {
    // Visual Triggers
    setAnimating(true);
    setPulse(true);
    setShowXpPopup(true);
    
    // Core Reward Logic: 1 detected item = 25 XP
    const xpPerBottle = 25;
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    
    const updatedUser = {
      ...user,
      points: user.points + (xpPerBottle * count),
      bottles: user.bottles + count
    };
    
    // Persist to "database"
    if (db.USER[user.id]) {
      db.USER[user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    
    // Sync active session
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    
    // Update Local UI
    setUser(updatedUser);
    onUpdate(updatedUser);
    
    // Reset animations
    setTimeout(() => {
      setAnimating(false);
      setPulse(false);
    }, 800);
    
    setTimeout(() => {
      setShowXpPopup(false);
    }, 2000);
  }, [user, onUpdate]);

  const connectBluetooth = async () => {
    try {
      setBleStatus('Scanning...');
      // Filter for ESP32 with name prefix 'GP-Bin'
      // Cast navigator to any to bypass TypeScript missing type for Web Bluetooth API
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'GP-Bin' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });

      setBleStatus('Pairing...');
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      const characteristic = await service?.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const decodedValue = new TextDecoder().decode(event.target.value);
        // The ESP32 sends 'B' when the IR sensor detects a bottle
        if (decodedValue.includes('B')) {
          handleReward(1);
        }
      });

      device.addEventListener('gattserverdisconnected', () => {
        setIsBleConnected(false);
        setBleStatus('Disconnected');
      });

      setIsBleConnected(true);
      setBleStatus('Link Established');
    } catch (err) {
      console.error('BLE Link Failure:', err);
      setBleStatus('Node Offline');
      setTimeout(() => setBleStatus('Disconnected'), 2000);
    }
  };

  const handleUnlockQr = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const record = db.USER[user.id];
    
    if (record && record.password === passwordAttempt) {
      setQrUnlocked(true);
      setError('');
    } else {
      setError('Invalid Pin-Key');
      setTimeout(() => setError(''), 2000);
    }
  };

  const loginUrl = `${window.location.origin}${window.location.pathname}?loginId=${user.id}&role=USER`;
  const avatarUrl = user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&top=${user.gender === 'FEMALE' ? 'longHair,hijab,turban' : 'shortHair,frizzle'}`;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700 relative">
      
      {/* Neural XP Popup */}
      {showXpPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 z-[100] xp-popup pointer-events-none">
          <div className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-[2rem] font-black shadow-[0_0_50px_rgba(16,185,129,0.6)] flex items-center space-x-3 border-4 border-white/20">
            <i className="fas fa-bolt text-xl"></i>
            <span className="text-xl">+25 XP EARNED</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Identity & Metrics Card */}
        <div className="lg:col-span-2 bg-[#0f1115] p-12 rounded-[3.5rem] border border-white/5 glass relative overflow-hidden shadow-2xl">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] -mr-40 -mt-40 transition-all duration-1000 ${pulse ? 'bg-emerald-500/30' : 'bg-emerald-500/5'}`}></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
            <div className="relative group">
              <div className={`absolute inset-0 rounded-[3.5rem] blur-2xl group-hover:blur-3xl transition-all duration-500 ${pulse ? 'bg-emerald-500/50 scale-110' : 'bg-emerald-500/20'}`}></div>
              <img 
                src={avatarUrl} 
                className={`w-52 h-52 rounded-[3.5rem] border-4 border-white/10 relative z-10 bg-[#05070a] object-cover transition-all duration-300 ${animating ? 'scale-105 rotate-2' : ''}`} 
                alt="Profile"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <span className="px-5 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {user.gender === 'FEMALE' ? 'Bio-Cycle Queen' : 'Eco-Link Specialist'}
                </span>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${isBleConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'} text-[9px] font-black uppercase tracking-tighter`}>
                  <div className={`w-2 h-2 rounded-full ${isBleConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></div>
                  <span>LINK: {bleStatus}</span>
                </div>
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-10 leading-none">{user.name}</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className={`bg-black/40 p-10 rounded-[2.5rem] border transition-all duration-300 ${animating ? 'scale-105 border-emerald-500/50 shadow-emerald-500/20' : 'border-white/5 shadow-xl'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Stored Experience</p>
                  <p className="text-6xl font-black text-emerald-400 tracking-tighter mono">
                    {user.points.toLocaleString()}
                    <span className="text-xs text-slate-600 ml-3">XP</span>
                  </p>
                </div>
                <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Units Processed</p>
                  <p className="text-6xl font-black text-white tracking-tighter mono">{user.bottles}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Node Control / Bluetooth Pairing Card */}
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-emerald-500/10 flex flex-col items-center justify-center text-center">
           <div className="mb-10">
             <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] mb-2">Node Sync Hub</p>
             <div className="h-[2px] w-12 bg-emerald-500 mx-auto"></div>
           </div>
           
           {!qrUnlocked ? (
             <div className="w-64 h-64 bg-[#05070a] rounded-[3rem] flex flex-col items-center justify-center p-10 space-y-6 shadow-inner">
                <i className="fas fa-shield-halved text-emerald-500/20 text-5xl mb-2"></i>
                <input 
                  type="password" 
                  placeholder="ENTITY PIN"
                  value={passwordAttempt}
                  onChange={e => setPasswordAttempt(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-3 px-4 text-white text-center text-xs outline-none focus:border-emerald-500/50 transition-all font-bold tracking-widest"
                />
                <button 
                  onClick={handleUnlockQr}
                  className="w-full py-4 bg-emerald-500 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Verify Access
                </button>
                {error && <p className="text-rose-500 text-[8px] font-black uppercase animate-shake">{error}</p>}
             </div>
           ) : (
             <div className="w-64 h-64 bg-[#05070a] p-6 rounded-[3rem] relative overflow-hidden group animate-in zoom-in-95 duration-500 shadow-2xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(loginUrl)}&bgcolor=05070a&color=10b981`} 
                  alt="Identity QR" 
                  className="w-full h-full relative z-10 group-hover:scale-110 transition-transform duration-700"
                />
                <button 
                  onClick={() => setQrUnlocked(false)}
                  className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-black/90 rounded-xl text-emerald-500 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <i className="fas fa-lock text-xs"></i>
                </button>
             </div>
           )}

           <h4 className="mt-12 text-slate-900 font-black tracking-[0.3em] uppercase text-xs mono">{user.id}</h4>
           
           <div className="flex flex-col w-full space-y-4 mt-10">
             <button 
               onClick={connectBluetooth}
               disabled={isBleConnected}
               className={`px-10 py-6 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3 ${isBleConnected ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40'}`}
             >
               <i className={`fas ${isBleConnected ? 'fa-link' : 'fa-bluetooth-b'} text-sm`}></i>
               <span>{isBleConnected ? 'Node Synchronized' : 'Pair with Smart Bin'}</span>
             </button>
             <button 
               onClick={() => handleReward(1)}
               className="px-10 py-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.75rem] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
             >
               Manual Entry (+25 XP)
             </button>
           </div>
           
           {isBleConnected && (
             <div className="mt-8 flex items-center space-x-3 text-emerald-600">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-[10px] font-black uppercase tracking-[0.15em] mono">Sensor Array Active</span>
             </div>
           )}
        </div>
      </div>

      {/* Analytics Footer */}
      <div className="bg-[#0f1115] p-12 rounded-[3.5rem] border border-white/5 glass shadow-2xl">
          <h3 className="text-2xl font-black text-white mb-10 tracking-tighter uppercase flex items-center">
            <i className="fas fa-chart-line mr-4 text-emerald-500"></i> Ecological Impact Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ImpactStat label="Carbon Reduction" value={`${(user.bottles * 0.08).toFixed(2)} kg`} icon="fa-cloud-sun" color="text-indigo-400" />
            <ImpactStat label="Recycling Velocity" value={`${user.bottles} Units`} icon="fa-bolt" color="text-emerald-400" />
            <ImpactStat label="Network Tier" value={`#${Math.max(1, 100 - Math.floor(user.points/1000))}`} icon="fa-trophy" color="text-amber-400" />
          </div>
      </div>
    </div>
  );
};

const ImpactStat: React.FC<{label: string; value: string; icon: string; color: string}> = ({label, value, icon, color}) => (
  <div className="bg-[#05070a] p-10 rounded-[2.5rem] border border-white/5 flex items-center space-x-8 hover:bg-white/5 hover:scale-[1.02] transition-all cursor-default group">
    <div className={`w-20 h-20 rounded-[1.75rem] bg-white/5 flex items-center justify-center text-3xl ${color} group-hover:scale-110 transition-transform duration-500`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter mono">{value}</p>
    </div>
  </div>
);

export default UserPortalView;
