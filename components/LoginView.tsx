
import React, { useState, useEffect } from 'react';
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

    setTimeout(() => {
      const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');

      if (mode === 'SIGNUP') {
        if (db[role][id]) {
          setError(`Conflict: Identity ${id} is already registered.`);
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

        db[role][id] = { password, profile: newUser };
        localStorage.setItem('gp_database', JSON.stringify(db));
        onLoginSuccess(newUser);
      } else {
        // Handle Default Admin
        if (role === 'ADMIN' && id === 'admin' && password === 'password123') {
           onLoginSuccess({ 
             id: 'ADM-001', 
             name: 'Super Admin', 
             role: 'ADMIN', 
             gender: 'MALE', 
             points: 0, 
             bottles: 0, 
             joinedAt: new Date().toISOString() 
           });
           return;
        }

        const record = db[role][id];
        if (record && record.password === password) {
          onLoginSuccess(record.profile);
        } else {
          setError('Auth failure: Invalid ID or Security Hash.');
          setLoading(false);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] p-4 relative overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${role === 'ADMIN' ? 'opacity-10' : 'opacity-20'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[150px]"></div>
      </div>
      
      <div className="w-full max-w-lg bg-[#0f1115] rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 p-10 md:p-16 border border-white/5 glass">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[1.75rem] shadow-2xl mb-6 rotate-3 transition-colors duration-500 ${role === 'ADMIN' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-900'}`}>
            <i className={`fas ${role === 'ADMIN' ? 'fa-user-shield' : 'fa-leaf'} text-3xl`}></i>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">GreenPoints <span className={role === 'ADMIN' ? 'text-indigo-400' : 'text-emerald-400'}>Core</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mono">Access Point: {role}</p>
        </div>

        <div className="flex bg-[#05070a] p-1.5 rounded-2xl border border-white/5 mb-6">
          <button onClick={() => setRole('USER')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'USER' ? 'bg-emerald-500 text-slate-900' : 'text-slate-500 hover:text-white'}`}>Student</button>
          <button onClick={() => setRole('ADMIN')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'ADMIN' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'}`}>Manager</button>
        </div>

        <div className="flex bg-[#05070a] p-1 rounded-xl border border-white/5 mb-8">
          <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'text-white bg-white/5' : 'text-slate-600'}`}>Login</button>
          <button onClick={() => setMode('SIGNUP')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'text-white bg-white/5' : 'text-slate-600'}`}>Signup</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'SIGNUP' && (
            <>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Operator Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 text-white font-bold" required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">AI Persona Alignment (Gender)</label>
                <div className="flex space-x-4 bg-[#05070a] p-1.5 rounded-2xl border border-white/5">
                  <button 
                    type="button"
                    onClick={() => setGender('MALE')} 
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${gender === 'MALE' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-600'}`}
                  >
                    Male AI
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGender('FEMALE')} 
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${gender === 'FEMALE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-600'}`}
                  >
                    Female AI
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Identifier ID</label>
            <input type="text" value={id} onChange={e => setId(e.target.value)} placeholder={role === 'USER' ? "ID-1002" : "MGR-001"} className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 text-white font-bold" required />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Security Key</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 text-white font-bold" required />
          </div>

          {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase text-center animate-shake">{error}</div>}

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl transition-all active:scale-95 ${role === 'ADMIN' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'}`}>
            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : mode === 'LOGIN' ? 'Authorize Session' : 'Generate Identity'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] mono">
          {mode === 'LOGIN' ? 'Default Root: admin / password123' : 'Secure Encrypted Node Registration'}
        </p>
      </div>
    </div>
  );
};

export default LoginView;
