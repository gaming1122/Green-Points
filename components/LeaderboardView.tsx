
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const LeaderboardView: React.FC = () => {
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Fetch all users from the persistent global database
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const users = Object.values(db.USER).map((entry: any) => entry.profile) as UserProfile[];
    
    // Sort by points descending
    const sorted = users.sort((a, b) => b.points - a.points);
    setRealUsers(sorted);
  }, []);

  return (
    <div className="bg-[#0f1115] rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 glass overflow-hidden animate-in fade-in duration-700 shadow-2xl">
      <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Global Standing</h3>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Real-time Ranking of Eco-Guardians</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{realUsers.length} Active Nodes</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest mono border-b border-white/5 bg-black/20">
              <th className="px-10 py-6">Rank</th>
              <th className="px-10 py-6">Identity Node</th>
              <th className="px-10 py-6">Collection</th>
              <th className="px-10 py-6">CO2 Offset (KG)</th>
              <th className="px-10 py-6 text-right">Sustainability Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {realUsers.length > 0 ? realUsers.map((user, index) => {
              const isTop3 = index < 3;
              const rankColor = index === 0 ? 'bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 
                                index === 1 ? 'bg-slate-300 text-slate-900' : 
                                index === 2 ? 'bg-orange-400 text-white' : 'bg-white/5 text-slate-500';
              
              return (
                <tr key={user.id} className={`group hover:bg-white/5 transition-all duration-300 ${index === 0 ? 'bg-emerald-500/5' : ''}`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 ${rankColor}`}>
                        {index + 1}
                      </div>
                      {index === 0 && <i className="fas fa-crown text-amber-400 animate-bounce text-xs"></i>}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img 
                          src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                          className="w-12 h-12 rounded-2xl bg-[#05070a] border border-white/10 group-hover:border-emerald-500/50 transition-colors object-cover" 
                          alt="P" 
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f1115] ${isTop3 ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                      </div>
                      <div>
                        <div className="text-sm md:text-base font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">{user.name}</div>
                        <div className="text-[9px] text-slate-500 font-bold mono uppercase tracking-widest">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-2">
                       <i className="fas fa-bottle-water text-slate-700 text-xs"></i>
                       <span className="text-sm font-black text-slate-300 mono">{user.bottles} Units</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-lg text-emerald-400/80 mono">
                      {(user.bottles * 0.08).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-lg md:text-xl font-black tracking-tighter mono ${index === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {user.points.toLocaleString()}
                      </span>
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Points</span>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="py-32 text-center">
                   <div className="flex flex-col items-center space-y-4 opacity-20">
                     <i className="fas fa-satellite-dish text-6xl"></i>
                     <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Scanning for active nodes...</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <i className="fas fa-info-circle mr-2"></i> Rank updates in real-time based on ESP32 signal ingestion.
        </p>
        <div className="flex space-x-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
           <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div>
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
