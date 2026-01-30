
import React, { useState, useRef } from 'react';
import { UserProfile, AppTheme } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbInputRef = useRef<HTMLInputElement>(null);

  const isLight = user.theme === 'LIGHT';

  const handleThemeChange = (newTheme: AppTheme) => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const updatedUser = { ...user, theme: newTheme };
    
    db[user.role][user.id].profile = updatedUser;
    localStorage.setItem('gp_database', JSON.stringify(db));
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    onUpdate(updatedUser);
  };

  const canUpdateImage = () => {
    if (!user.lastImageUpdate) return true;
    const lastUpdate = new Date(user.lastImageUpdate).getTime();
    const now = new Date().getTime();
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    return now - lastUpdate >= sixtyDaysInMs;
  };

  const getNextUpdateDate = () => {
    if (!user.lastImageUpdate) return null;
    const nextUpdate = new Date(user.lastImageUpdate);
    nextUpdate.setDate(nextUpdate.getDate() + 60);
    return nextUpdate.toLocaleDateString();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canUpdateImage()) {
      setUploadError(`Update locked until ${getNextUpdateDate()}`);
      return;
    }

    if (file.size > 1024 * 1024 * 2) {
      setUploadError('Image exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
      const updatedUser = { 
        ...user, 
        profileImage: base64, 
        lastImageUpdate: new Date().toISOString() 
      };
      
      db[user.role][user.id].profile = updatedUser;
      localStorage.setItem('gp_database', JSON.stringify(db));
      localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const updatedUser = { ...user, name };
    
    db[user.role][user.id].profile = updatedUser;
    localStorage.setItem('gp_database', JSON.stringify(db));
    localStorage.setItem('gp_active_session', JSON.stringify(updatedUser));
    onUpdate(updatedUser);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportDatabase = () => {
    const db = localStorage.getItem('gp_database');
    if (!db) return;
    const blob = new Blob([db], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gp_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content); // Validate JSON
        localStorage.setItem('gp_database', content);
        alert('Database imported successfully. Page will reload to apply changes.');
        window.location.reload();
      } catch (err) {
        alert('Invalid database file format.');
      }
    };
    reader.readAsText(file);
  };

  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&top=${user.gender === 'FEMALE' ? 'longHair,hijab,turban' : 'shortHair,frizzle'}`;
  const currentAvatar = user.profileImage || avatarFallback;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        
        <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border glass shadow-2xl ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5'}`}>
          <h3 className={`text-xl font-black tracking-tighter mb-8 uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <i className="fas fa-fingerprint mr-3 text-emerald-500"></i> Identity Calibration
          </h3>
          
          <div className="space-y-8">
            <div className={`flex flex-col items-center space-y-6 p-8 rounded-[2.5rem] border relative group ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'}`}>
              <div className="relative">
                <img src={currentAvatar} className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3.5rem] border-4 object-cover shadow-2xl ${!canUpdateImage() ? 'grayscale' : ''} ${isLight ? 'bg-white border-white' : 'bg-black border-white/5'}`} alt="Avatar" />
                {canUpdateImage() && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                    <i className="fas fa-camera text-sm"></i>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <div className="text-center">
                {!canUpdateImage() ? (
                  <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest"><i className="fas fa-lock mr-2"></i> Locked for 60 Days</p>
                ) : (
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Update Authorized</p>
                )}
                {uploadError && <p className="text-[8px] text-rose-500 font-black uppercase mt-1">{uploadError}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Operator Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full border rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 font-bold transition-all ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#05070a] border-white/5 text-white'}`} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">System ID</label>
                <input type="text" value={user.id} disabled className={`w-full border rounded-2xl py-4 px-6 font-black mono cursor-not-allowed opacity-40 italic ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#05070a] border-white/10 text-slate-700'}`} />
              </div>
              <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${saved ? 'bg-emerald-500 text-slate-900 shadow-lg' : (isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10')}`}>
                {saved ? 'Changes Synced' : 'Commit Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Theme Selector */}
          <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border glass shadow-2xl ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5'}`}>
            <h3 className={`text-xl font-black tracking-tighter mb-8 uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <i className={`fas ${isLight ? 'fa-sun' : 'fa-moon'} mr-3 text-amber-500`}></i> Interface Theme
            </h3>
            <div className={`flex p-1.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#05070a] border-white/5'}`}>
               <button 
                onClick={() => handleThemeChange('DARK')}
                className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${user.theme === 'DARK' || !user.theme ? 'bg-[#0f1115] text-white shadow-xl border border-white/5' : 'text-slate-500'}`}
               >
                 <i className="fas fa-moon"></i>
                 <span>Dark Mode</span>
               </button>
               <button 
                onClick={() => handleThemeChange('LIGHT')}
                className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${user.theme === 'LIGHT' ? 'bg-white text-slate-900 shadow-xl border border-slate-200' : 'text-slate-500'}`}
               >
                 <i className="fas fa-sun"></i>
                 <span>Light Mode</span>
               </button>
            </div>
          </div>

          {/* Data Portability for Admins */}
          {user.role === 'ADMIN' && (
            <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border glass shadow-2xl ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f1115] border-white/5'}`}>
              <h3 className={`text-xl font-black tracking-tighter mb-8 uppercase flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <i className="fas fa-database mr-3 text-indigo-400"></i> Node Data Management
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                Export the global entity database to a JSON file for backup or import a previously saved cluster to this node.
              </p>
              <div className="space-y-4">
                <button onClick={exportDatabase} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-3 transition-all active:scale-95 ${isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100' : 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20'}`}>
                  <i className="fas fa-cloud-arrow-down"></i>
                  <span>Export Database (.json)</span>
                </button>
                <button onClick={() => dbInputRef.current?.click()} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-3 transition-all active:scale-95 ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}>
                  <i className="fas fa-cloud-arrow-up"></i>
                  <span>Restore from Backup</span>
                </button>
                <input type="file" ref={dbInputRef} onChange={importDatabase} accept=".json" className="hidden" />
              </div>
            </div>
          )}

          <div className={`p-8 rounded-[2.5rem] border glass ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1115] border-white/5'}`}>
            <h4 className={`text-sm font-black tracking-widest mb-4 uppercase ${isLight ? 'text-slate-800' : 'text-white'}`}>System Integrity</h4>
            <div className="space-y-4">
               <div className={`flex items-center justify-between p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-100' : 'bg-black/40 border-white/5'}`}>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Local Node Sync</span>
                 <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded">Healthy</span>
               </div>
               <div className={`flex items-center justify-between p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-100' : 'bg-black/40 border-white/5'}`}>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data Encryption</span>
                 <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase rounded">AES-256</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
