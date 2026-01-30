
import React, { useState } from 'react';
import { UserRole, UserProfile, Gender } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [role, setRole] = useState<UserRole>('USER');
  const [gender, setGender] = useState<Gender>('MALE');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate database network delay
    setTimeout(() => {
      // Get the existing database or initialize a new one
      const dbStr = localStorage.getItem('gp_database');
      const db = dbStr ? JSON.parse(dbStr) : { "ADMIN": {}, "USER": {} };

      if (mode === 'SIGNUP') {
        // Prevent duplicate IDs
        if (db[role][id]) {
          setError(`Conflict: Identity ID [${id}] already registered in the system.`);
          setLoading(false);
          return;
        }
        
        const newUser: UserProfile = {
          id,
          name,
          role,
          gender,
          points: 0,
          bottles: 0,
          joinedAt: new Date().toISOString()
        };

        // Store in the permanent local database
        db[role][id] = { password, profile: newUser };
        localStorage.setItem('gp_database', JSON.stringify(db));
        
        // Log in immediately after signup
        onLoginSuccess(newUser);
      } else {
        // Master Admin bypass for initial setup
        if (role === 'ADMIN' && id === 'admin' && password === 'password123') {
           onLoginSuccess({ 
             id: 'ADM-MASTER', 
             name: 'System Architect', 
             role: 'ADMIN', 
             gender: 'MALE', 
             points: 0, 
             bottles: 0, 
             joinedAt: new Date().toISOString() 
           });
           return;
        }

        // Check credentials from persistent storage
        const record = db[role][id];
        if (record && record.password === password) {
          onLoginSuccess(record.profile);
        } else {
          setError('Authorization Failed: Identity ID or Security Key is incorrect.');
          setLoading(false);
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] p-4 relative overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${role === 'ADMIN' ? 'opacity-10' : 'opacity-20'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[100px] md:blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[100px] md:blur-[150px]"></div>
      </div>
      
      <div className="w-full max-w-lg bg-[#0f1115] rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 p-8 md:p-14 border border-white/5 glass">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl mb-4 transition-colors duration-500 ${role === 'ADMIN' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-900'}`}>
            <i className={`fas ${role === 'ADMIN' ? 'fa-user-shield' : 'fa-leaf'} text-2xl`}></i>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-1">GreenPoints <span className={role === 'ADMIN' ? 'text-indigo-400' : 'text-emerald-400'}>Core</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px] mono">Protocol: {mode} / Role: {role}</p>
        </div>

        <div className="flex bg-[#05070a] p-1.5 rounded-2xl border border-white/5 mb-6">
          <button type="button" onClick={() => { setRole('USER'); setError(''); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === 'USER' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>Eco Student</button>
          <button type="button" onClick={() => { setRole('ADMIN'); setError(''); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === 'ADMIN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Node Manager</button>
        </div>

        <div className="flex bg-[#05070a] p-1 rounded-xl border border-white/5 mb-6">
          <button type="button" onClick={() => { setMode('LOGIN'); setError(''); }} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'text-white bg-white/10' : 'text-slate-600'}`}>Sign In</button>
          <button type="button" onClick={() => { setMode('SIGNUP'); setError(''); }} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'text-white bg-white/10' : 'text-slate-600'}`}>Create ID</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'SIGNUP' && (
            <>
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-white/20 text-white font-bold text-sm transition-all" required />
              </div>
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Bio Profile</label>
                <div className="flex space-x-3 bg-[#05070a] p-1 rounded-2xl border border-white/5">
                  <button type="button" onClick={() => setGender('MALE')} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${gender === 'MALE' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-600 border border-transparent'}`}>Male Avatar</button>
                  <button type="button" onClick={() => setGender('FEMALE')} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${gender === 'FEMALE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-600 border border-transparent'}`}>Female Avatar</button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Identity ID (Unique)</label>
            <input type="text" value={id} onChange={e => setId(e.target.value)} placeholder={role === 'USER' ? "ID-101" : "MGR-01"} className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-white/20 text-white font-bold text-sm transition-all mono" required />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Security Key</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-white/20 text-white font-bold text-sm transition-all" required />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[9px] font-black uppercase text-center animate-shake">
              <i className="fas fa-triangle-exclamation mr-2"></i> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-xs shadow-xl active:scale-95 transition-all mt-4 ${role === 'ADMIN' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'}`}>
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : mode === 'LOGIN' ? 'Verify Identity' : 'Establish Record'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-600 text-[8px] font-bold uppercase tracking-[0.3em] mono opacity-50">
          Persistent Cloud Storage: Local Node Active
        </p>
      </div>
    </div>
  );
};

export default LoginView;
