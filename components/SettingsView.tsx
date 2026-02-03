
import React, { useState, useRef, useCallback } from 'react';
import { UserProfile, AppTheme } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  
  // BLE States for Hardware Link
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [bleStatus, setBleStatus] = useState('Standby');
  const [signalLog, setSignalLog] = useState<{msg: string, time: string, id: number}[]>([]);
  const logRef = useRef<{msg: string, time: string, id: number}[]>([]);
  const [error, setError] = useState('');

  const isLight = user.theme === 'LIGHT';

  const handleReward = useCallback((count: number = 1) => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const updatedUser = {
      ...user,
      points: (user.points || 0) + (25 * count),
      bottles: (user.bottles || 0) + count
    };
    
    // Update persistence in DB
    if (db[user.role] && db[user.role][user.id]) {
      db[user.role][user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    onUpdate(updatedUser);

    // Update internal log for visual feedback
    const logMsg = { 
      id: Date.now(),
      msg: `BOTTLE DETECTED: +25 XP / +0.08kg CO2`, 
      time: new Date().toLocaleTimeString() 
    };
    logRef.current = [logMsg, ...logRef.current].slice(0, 5);
    setSignalLog([...logRef.current]);
  }, [user, onUpdate]);

  const connectBluetooth = async () => {
    if (!(navigator as any).bluetooth) {
      setError('Bluetooth LE not supported. Use a modern browser on HTTPS.');
      return;
    }
    setBleStatus('Scanning for GP-Bin...');
    setError('');
    
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'GP-Bin' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });

      setBleStatus(`Node Linked: ${device.name}`);
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      const char = await service?.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      
      await char?.startNotifications();
      
      char?.addEventListener('characteristicvaluechanged', (e: any) => {
        const val = new TextDecoder().decode(e.target.value).trim();
        if (val === 'B') {
          handleReward(1);
        }
      });

      setIsBleConnected(true);
      setBleStatus('Sync Active');
    } catch (err: any) {
      console.error(err);
      setError(err.message.includes('User cancelled') ? 'Link Cancelled.' : 'Hardware Link Failed.');
      setBleStatus('Standby');
    }
  };

  const handleSave = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const updatedUser = { ...user, name };
    if (db[user.role] && db[user.role][user.id]) {
      db[user.role][user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    onUpdate(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const updatedUser = { ...user, theme: newTheme };
    if (db[user.role] && db[user.role][user.id]) {
      db[user.role][user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    onUpdate(updatedUser);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-32 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <h2 className={`text-5xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>System Management</h2>
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono">IoT Configuration Portal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Profile Control */}
        <div className={`p-12 rounded-[3.5rem] border shadow-2xl transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl shadow-inner">
              <i className="fas fa-id-card"></i>
            </div>
            <div>
              <h3 className={`text-2xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>Identity Core</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Profile Access</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Operator Display Handle</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className={`w-full border rounded-3xl py-6 px-8 font-black text-lg outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-black/40 border-white/5 text-white focus:border-emerald-500/50'}`} 
              />
            </div>
            <button 
              onClick={handleSave} 
              className="w-full py-6 bg-emerald-500 text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-400 active:scale-95 transition-all shadow-emerald-500/20"
            >
              {saved ? <><i className="fas fa-check-double mr-2"></i> Synced</> : 'Commit Updates'}
            </button>
          </div>
        </div>

        {/* HIGH-TECH HARDWARE HUB (Admin Setting Option) */}
        <div className={`p-12 rounded-[3.5rem] border shadow-2xl transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-2xl shadow-inner">
                <i className="fas fa-microchip"></i>
              </div>
              <div>
                <h3 className={`text-2xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>IoT Ingestion Hub</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ESP32 Bluetooth Link</p>
              </div>
            </div>
            {isBleConnected && (
              <div className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE SYNC
              </div>
            )}
          </div>

          <div className="space-y-8">
             {/* Scanner Interface */}
             <div className="relative group">
                <div className={`aspect-video rounded-[2.5rem] border flex flex-col items-center justify-center space-y-6 transition-all relative overflow-hidden ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5 shadow-inner'}`}>
                  <div className={`transition-all duration-700 ${isBleConnected ? 'text-emerald-500 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-slate-700 grayscale'}`}>
                    <i className={`fas ${isBleConnected ? 'fa-link' : 'fa-satellite-dish'} text-6xl`}></i>
                  </div>
                  <div className="text-center px-6">
                    <p className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 ${isBleConnected ? 'text-emerald-500' : 'text-slate-600'}`}>
                      {isBleConnected ? 'Protocol Active' : 'Waiting for Signal'}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mono">{bleStatus}</p>
                  </div>
                  
                  {/* The Scan Line Effect */}
                  <div className={`absolute top-0 left-0 w-full h-[2px] shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all ${isBleConnected ? 'bg-emerald-500 animate-scan-line' : 'bg-white/5'}`}></div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={connectBluetooth} 
                    disabled={isBleConnected} 
                    className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
                      isBleConnected 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-600/20'
                    }`}
                  >
                     {isBleConnected ? 'Hardware Linked' : 'Connect ESP32 Node'}
                  </button>
                  {isBleConnected && (
                    <button 
                      onClick={() => { setIsBleConnected(false); setBleStatus('Standby'); }}
                      className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg"
                    >
                      <i className="fas fa-power-off"></i>
                    </button>
                  )}
                </div>
             </div>

             {/* Calculation Logic Info */}
             <div className={`p-6 rounded-3xl border flex items-center gap-6 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/5'}`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">
                   <i className="fas fa-calculator"></i>
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Inbound Reward Mapping</p>
                   <p className="text-xs font-black text-white tracking-tight uppercase">1 Signal = 1 Bottle = 25 XP = 0.08kg CO2</p>
                </div>
             </div>

             {/* Live Data Log Feed */}
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Telemetry</p>
                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Live Feed</span>
                </div>
                <div className={`min-h-[160px] p-8 rounded-[2.5rem] border flex flex-col space-y-4 transition-all ${isLight ? 'bg-slate-50 border-slate-200 shadow-inner' : 'bg-black/60 border-white/5 shadow-2xl'}`}>
                  {signalLog.length > 0 ? signalLog.map(log => (
                    <div key={log.id} className="flex justify-between items-center animate-in slide-in-from-left-4 duration-300 border-l-2 border-emerald-500 pl-4">
                       <div className="flex items-center space-x-3">
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tight">{log.msg}</span>
                       </div>
                       <span className="text-[9px] font-bold text-slate-600 mono">{log.time}</span>
                    </div>
                  )) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-3">
                       <i className="fas fa-wifi text-3xl"></i>
                       <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Pulse</p>
                    </div>
                  )}
                </div>
             </div>

             {error && (
               <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase text-center rounded-2xl animate-shake tracking-widest">
                 {error}
               </div>
             )}
          </div>
        </div>

        {/* Interface Modality */}
        <div className={`p-12 rounded-[3.5rem] border shadow-2xl lg:col-span-2 transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f1115] border-white/5 glass'}`}>
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl shadow-inner">
              <i className="fas fa-palette"></i>
            </div>
            <div>
              <h3 className={`text-2xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>Visual Modality</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Theme Engine</p>
            </div>
          </div>

          <div className={`flex p-3 rounded-[2.5rem] border shadow-inner ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#05070a] border-white/5'}`}>
             <button 
              onClick={() => handleThemeChange('DARK')} 
              className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 ${user.theme === 'DARK' ? 'bg-[#0f1115] text-white shadow-2xl border border-white/10' : 'text-slate-500 hover:text-slate-400'}`}
             >
               <i className="fas fa-moon"></i>
               <span>Dark Interface</span>
             </button>
             <button 
              onClick={() => handleThemeChange('LIGHT')} 
              className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 ${user.theme === 'LIGHT' ? 'bg-white text-slate-900 shadow-2xl border border-slate-200' : 'text-slate-500 hover:text-slate-600'}`}
             >
               <i className="fas fa-sun"></i>
               <span>Light Interface</span>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
