
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

  // Core logic: This function is now ONLY triggered by the IoT Node (Bluetooth)
  const handleReward = useCallback((count: number = 1) => {
    setAnimating(true);
    setPulse(true);
    setShowXpPopup(true);
    
    const xpPerBottle = 25;
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    
    const updatedUser = {
      ...user,
      points: user.points + (xpPerBottle * count),
      bottles: user.bottles + count
    };
    
    // Persist to local database
    if (db.USER[user.id]) {
      db.USER[user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    
    // Update active session and state
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    setUser(updatedUser);
    onUpdate(updatedUser);
    
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
      // Request ESP32 device
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'GP-Bin' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });

      setBleStatus('Connecting...');
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      const characteristic = await service?.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

      // Listen for signals from ESP32
      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const decodedValue = new TextDecoder().decode(event.target.value);
        // If the ESP32 sends 'B' (Bottle detected), increment points
        if (decodedValue.trim() === 'B') {
          handleReward(1);
        }
      });

      device.addEventListener('gattserverdisconnected', () => {
        setIsBleConnected(false);
        setBleStatus('Disconnected');
      });

      setIsBleConnected(true);
      setBleStatus('Synced');
    } catch (err) {
      console.error('BLE Link Failure:', err);
      setBleStatus('Link Failed');
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
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-6 duration-700 relative">
      
      {showXpPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 z-[100] xp-popup pointer-events-none">
          <div className="bg-emerald-500 text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-full font-black shadow-[0_0_50px_rgba(16,185,129,0.6)] flex items-center space-x-3 border-4 border-white/20 whitespace-nowrap">
            <i className="fas fa-bolt text-lg"></i>
            <span className="text-lg md:text-xl">+25 XP EARNED</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        {/* Identity & Metrics Card */}
        <div className="lg:col-span-2 bg-[#0f1115] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 glass relative overflow-hidden shadow-2xl">
          <div className={`absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[80px] md:blur-[120px] -mr-20 -mt-20 md:-mr-40 md:-mt-40 transition-all duration-1000 ${pulse ? 'bg-emerald-500/30' : 'bg-emerald-500/5'}`}></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative z-10">
            <div className="relative group">
              <div className={`absolute inset-0 rounded-[2rem] md:rounded-[3.5rem] blur-xl md:blur-2xl transition-all duration-500 ${pulse ? 'bg-emerald-500/50 scale-110' : 'bg-emerald-500/20'}`}></div>
              <img 
                src={avatarUrl} 
                className={`w-32 h-32 md:w-52 md:h-52 rounded-[2rem] md:rounded-[3.5rem] border-4 border-white/10 relative z-10 bg-[#05070a] object-cover transition-all duration-300 ${animating ? 'scale-105 rotate-2' : ''}`} 
                alt="Profile"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <span className="px-3 md:px-5 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  {user.gender === 'FEMALE' ? 'Bio-Cycle Queen' : 'Eco-Link Specialist'}
                </span>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${isBleConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'} text-[8px] md:text-[9px] font-black uppercase tracking-tighter`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isBleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                  <span>LINK: {bleStatus}</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-8 md:mb-10 leading-none truncate w-full">{user.name}</h2>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className={`bg-black/40 p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border transition-all duration-300 ${animating ? 'scale-105 border-emerald-500/50 shadow-emerald-500/20' : 'border-white/5 shadow-xl'}`}>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Stored XP</p>
                  <p className="text-2xl md:text-6xl font-black text-emerald-400 tracking-tighter mono leading-none">
                    {user.points}
                  </p>
                </div>
                <div className="bg-black/40 p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/5 shadow-xl">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Items</p>
                  <p className="text-2xl md:text-6xl font-black text-white tracking-tighter mono leading-none">{user.bottles}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Section */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center text-center">
           <div className="mb-8">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Node Sync QR</p>
             <div className="h-[2px] w-8 bg-emerald-500 mx-auto"></div>
           </div>
           
           {!qrUnlocked ? (
             <div className="w-48 h-48 md:w-64 md:h-64 bg-[#05070a] rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center p-6 space-y-4 shadow-inner">
                <i className="fas fa-fingerprint text-emerald-500/20 text-4xl"></i>
                <input 
                  type="password" 
                  placeholder="PIN"
                  value={passwordAttempt}
                  onChange={e => setPasswordAttempt(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 rounded-xl py-3 px-4 text-white text-center text-xs outline-none focus:border-emerald-500/50 transition-all font-bold tracking-widest"
                />
                <button 
                  onClick={handleUnlockQr}
                  className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  Unlock QR
                </button>
                {error && <p className="text-rose-500 text-[8px] font-black uppercase animate-shake">{error}</p>}
             </div>
           ) : (
             <div className="w-48 h-48 md:w-64 md:h-64 bg-[#05070a] p-4 rounded-3xl md:rounded-[3rem] relative overflow-hidden group animate-in zoom-in-95 duration-500 shadow-2xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(loginUrl)}&bgcolor=05070a&color=10b981`} 
                  alt="Identity QR" 
                  className="w-full h-full relative z-10"
                />
                <button 
                  onClick={() => setQrUnlocked(false)}
                  className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-black/90 rounded-lg text-emerald-500 border border-emerald-500/30 flex items-center justify-center"
                >
                  <i className="fas fa-lock text-[10px]"></i>
                </button>
             </div>
           )}

           <div className="mt-6 space-y-2">
             <h4 className="text-slate-900 font-black tracking-[0.2em] uppercase text-[10px] mono">{user.id}</h4>
             <p className="text-slate-400 text-[8px] font-bold uppercase max-w-[200px] mx-auto">Scan on mobile to sync with Eco-Node Alpha.</p>
           </div>
           
           <div className="flex flex-col w-full space-y-3 mt-8">
             <button 
               onClick={connectBluetooth}
               disabled={isBleConnected}
               className={`w-full py-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-3 shadow-xl ${isBleConnected ? 'bg-emerald-500 text-slate-900' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
             >
               <i className={`fas ${isBleConnected ? 'fa-link' : 'fa-bluetooth-b'}`}></i>
               <span>{isBleConnected ? 'NODE SYNCED' : 'PAIR ESP32 NODE'}</span>
             </button>
             
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Hardware Status</p>
               <p className="text-[10px] font-bold text-slate-600 leading-tight italic">
                 {isBleConnected ? "Waiting for ESP32 sensor signals. Insert bottle now." : "Connect to a GP-Bin Node via Bluetooth to start earning XP automatically."}
               </p>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-[#0f1115] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 glass shadow-2xl overflow-x-hidden">
          <h3 className="text-xl md:text-2xl font-black text-white mb-8 tracking-tighter uppercase flex items-center">
            <i className="fas fa-chart-line mr-3 text-emerald-500"></i> Sustainability Proof
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <ImpactStat label="Carbon Offset" value={`${(user.bottles * 0.08).toFixed(2)}kg`} icon="fa-cloud-sun" color="text-indigo-400" />
            <ImpactStat label="Collection Node" value="ESP32-CORE" icon="fa-microchip" color="text-emerald-400" />
            <ImpactStat label="Network Rank" value={`#${Math.max(1, 100 - Math.floor(user.points/1000))}`} icon="fa-trophy" color="text-amber-400" />
          </div>
      </div>
    </div>
  );
};

const ImpactStat: React.FC<{label: string; value: string; icon: string; color: string}> = ({label, value, icon, color}) => (
  <div className="bg-[#05070a] p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex items-center space-x-5 md:space-x-8 hover:bg-white/5 transition-all">
    <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.75rem] bg-white/5 flex items-center justify-center text-xl md:text-3xl ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-[9px] md:text-[11px] font-black text-slate-600 uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
      <p className="text-xl md:text-3xl font-black text-white tracking-tighter mono">{value}</p>
    </div>
  </div>
);

export default UserPortalView;
