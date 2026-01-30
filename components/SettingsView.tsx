
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user can update image (60 days = ~2 months)
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

    if (file.size > 1024 * 1024 * 2) { // 2MB limit
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

  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&top=${user.gender === 'FEMALE' ? 'longHair,hijab,turban' : 'shortHair,frizzle'}`;
  const currentAvatar = user.profileImage || avatarFallback;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5 glass shadow-2xl">
        <h3 className="text-xl font-black text-white tracking-tighter mb-8 uppercase flex items-center">
          <i className="fas fa-fingerprint mr-3 text-emerald-500"></i>
          Identity Core Calibration
        </h3>
        
        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-6 bg-black/20 p-8 rounded-[2.5rem] border border-white/5 relative group">
            <div className="relative">
              <img 
                src={currentAvatar} 
                className={`w-36 h-36 rounded-[2.5rem] bg-black border-4 border-white/5 object-cover shadow-2xl transition-all ${!canUpdateImage() ? 'grayscale' : ''}`} 
                alt="Avatar" 
              />
              {canUpdateImage() && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <i className="fas fa-camera text-sm"></i>
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visual Verification</p>
              {!canUpdateImage() ? (
                <p className="text-[9px] text-amber-500 font-bold uppercase mono">
                  <i className="fas fa-clock mr-1"></i> Cooldown Active. Next update: {getNextUpdateDate()}
                </p>
              ) : (
                <p className="text-[9px] text-emerald-500 font-bold uppercase mono">Bio-metric update available (1/2mo)</p>
              )}
              {uploadError && <p className="text-rose-500 text-[9px] font-bold mt-2 uppercase mono">{uploadError}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Operator Identity</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 text-white font-bold transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Entity ID</label>
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest border border-rose-500/20 px-2 py-0.5 rounded">Immutable</span>
              </div>
              <input 
                type="text" 
                value={user.id} 
                disabled
                className="w-full bg-[#05070a] border border-white/10 rounded-2xl py-4 px-6 text-slate-700 font-black mono cursor-not-allowed opacity-40 italic"
              />
            </div>

            <button 
              onClick={handleSave}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${saved ? 'bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
            >
              {saved ? <><i className="fas fa-check mr-2"></i> Synced to Cloud</> : 'Commit Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0f1115] p-6 rounded-3xl border border-white/5 glass">
        <h4 className="text-sm font-black text-white tracking-widest mb-4 uppercase text-center md:text-left">Privacy Policy</h4>
        <p className="text-[9px] text-slate-600 font-bold leading-relaxed uppercase tracking-wider">
          Entity ID is fixed at the moment of genesis and cannot be altered via user interface for chain integrity. 
          Bio-metric images are stored locally in the secure node and cached for 60-day cycles.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
