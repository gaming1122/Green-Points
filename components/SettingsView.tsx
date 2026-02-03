
import React, { useState, useRef, useCallback } from 'react';
import { UserProfile, AppTheme } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bluetooth State
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [bleStatus, setBleStatus] = useState('Disconnected');
  const [signalLog, setSignalLog] = useState<{msg: string, time: string}[]>([]);
  const logRef = useRef<{msg: string, time: string}[]>([]);
  const [error, setError] = useState('');

  const isLight = user.theme === 'LIGHT';

  const addLog = (msg: string) => {
    const newLog = { msg, time: new Date().toLocaleTimeString() };
    logRef.current = [newLog, ...logRef.current].slice(0, 5);
    setSignalLog([...logRef.current]);
  };

  const handleReward = useCallback((count: number = 1) => {
    const xpPerBottle = 25; 
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    
    // Update current operator's points and bottles
    const updatedUser = {
      ...user,
      points: (user.points || 0) + (xpPerBottle * count),
      bottles: (user.bottles || 0) + count
    };
    
    // Update database
    if (db[user.role] && db[user.role][user.id]) {
      db[user.role][user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
    }
    
    // Update active session
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    onUpdate(updatedUser);
  }, [user, onUpdate]);

  const connectBluetooth = async () => {
    setError('');
    
    if (!(navigator as any).bluetooth) {
      setError('Bluetooth not supported or requires HTTPS.');
      return;
    }

    try {
      const isAvailable = await (navigator as any).bluetooth.getAvailability();
      if (!isAvailable) {
        setError('Bluetooth adapter is turned off or not available.');
        return;
      }

      setBleStatus('Scanning for Node...');
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'GP-Bin' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });
      
      setBleStatus('Connecting...');
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      const characteristic = await service?.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      
      await characteristic?.startNotifications();
      addLog(`LINKED: ${device.name}`);
      
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const decodedValue = new TextDecoder().decode(event.target.value);
        if (decodedValue.trim() === 'B') {
          addLog('ESP32: BOTTLE DETECTED');
          handleReward(1);
          
          // Audio feedback
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
          } catch(e) {}
        }
      });
      
      device.addEventListener('gattserverdisconnected', () => {
        setIsBleConnected(false);
        setBleStatus('Disconnected');
        addLog('ERR: CONNECTION LOST');
      });

      setIsBleConnected(true);
      setBleStatus('Live & Active');
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotFoundError') {
        setBleStatus('Disconnected');
      } else {
        setError(err.message || 'Connection failed.');
        setBleStatus('Disconnected');
      }
    }
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
      const updatedUser = { ...user, profileImage: base64, lastImageUpdate: new Date().toISOString() };
      if (db[user.role] && db[user.role][user.id]) {
        db[user.role][user.id].profile = updatedUser;
        localStorage.setItem('gp_database', JSON.stringify(db));
      }
      localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
    };
    reader.readAsDataURL(file);
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

  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
  const currentAvatar = user.profileImage || avatarFallback;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        
        {/* Profile Card */}
        <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border glass shadow-2xl ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5'}`}>
          <h3 className={`text-xl font-black tracking-tighter mb-8 uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <i className="fas fa-id-badge mr-3 text-emerald-500"></i> Personnel ID
          </h3>
          <div className="space-y-8">
            <div className={`flex flex-col items-center space-y-6 p-8 rounded-[2.5rem] border relative group ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'}`}>
              <div className="relative">
                <img src={currentAvatar} className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3.5rem] border-4 object-cover shadow-2xl ${isLight ? 'bg-white border-white' : 'bg-black border-white/5'}`} alt="Avatar" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                  <i className="fas fa-camera text-sm"></i>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Operator Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full border rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 font-bold ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#05070a] border-white/5 text-white'}`} />
              </div>
              <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${saved ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
                {saved ? 'Changes Commited' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Hardware Configuration */}
        <div className="space-y-6 md:space-y-8">
          <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border glass shadow-2xl overflow-hidden relative ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5'}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-20 rounded-full transition-all duration-1000 ${isBleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`}></div>
            
            <h3 className={`text-xl font-black tracking-tighter mb-8 uppercase flex items-center relative z-10 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <i className="fas fa-satellite-dish mr-3 text-indigo-400"></i> Hardware Terminal
            </h3>
            
            <div className="relative z-10">
              <div className={`mb-6 p-5 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5 shadow-inner'}`}>
                <div className="flex items-center justify-between mb-3">
                   <span className={`text-[10px] font-black uppercase tracking-widest ${isBleConnected ? 'text-emerald-500' : 'text-slate-500'}`}>Status: {bleStatus}</span>
                   {isBleConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
                </div>
                
                <div className={`space-y-1 h-28 overflow-y-auto custom-scrollbar pr-2 p-3 rounded-xl mb-4 font-mono text-[9px] ${isLight ? 'bg-white text-slate-800' : 'bg-black/60 text-slate-400'}`}>
                  {signalLog.map((log, i) => (
                    <div key={i} className={`flex justify-between items-center ${i === 0 ? 'text-emerald-500' : 'opacity-40'}`}>
                      <span>> {log.msg}</span>
                      <span className="opacity-30">{log.time}</span>
                    </div>
                  ))}
                  {signalLog.length === 0 && <p className="text-center mt-8 opacity-20 uppercase tracking-widest">Scanning For Signal</p>}
                </div>

                <button 
                  onClick={connectBluetooth}
                  disabled={isBleConnected}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-xl ${isBleConnected ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'}`}
                >
                  <i className={`fas ${isBleConnected ? 'fa-link' : 'fa-bluetooth-b'} text-lg`}></i>
                  <span>{isBleConnected ? 'Active Link' : 'Pair with ESP32 Node'}</span>
                </button>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start space-x-3 animate-shake">
                   <i className="fas fa-triangle-exclamation text-rose-500 mt-1"></i>
                   <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border glass shadow-2xl ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5'}`}>
            <h3 className={`text-xl font-black tracking-tighter mb-6 uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <i className="fas fa-adjust mr-3 text-amber-500"></i> Interface Config
            </h3>
            <div className={`flex p-1.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#05070a] border-white/5'}`}>
               <button onClick={() => handleThemeChange('DARK')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${user.theme === 'DARK' ? 'bg-[#0f1115] text-white shadow-xl' : 'text-slate-500 hover:text-slate-400'}`}>Midnight Protocol</button>
               <button onClick={() => handleThemeChange('LIGHT')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${user.theme === 'LIGHT' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-600'}`}>Arctic Logic</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
