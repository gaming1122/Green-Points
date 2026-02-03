
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const LeaderboardView: React.FC = () => {
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const users = Object.values(db.USER || {}).map((entry: any) => entry.profile) as UserProfile[];
    const sorted = users.sort((a, b) => b.points - a.points);
    setRealUsers(sorted);
  }, []);

  return (
    <div className="bg-[#0f1115] rounded-[3.5rem] border border-white/5 glass overflow-hidden shadow-2xl animate-in fade-in duration-700">
      <div className="p-12 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2">Global Ranking</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Network Identity Standings</p>
        </div>
        <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{realUsers.length} Users Active</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-black text-slate-600 uppercase tracking-widest bg-black/20 border-b border-white/5">
              <th className="px-10 py-8">Rank</th>
              <th className="px-10 py-8">Operator</th>
              <th className="px-10 py-8">Bottles</th>
              <th className="px-10 py-8 text-right">XP Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {realUsers.length > 0 ? realUsers.map((user, index) => (
              <tr key={user.id} className="group hover:bg-white/5 transition-all">
                <td className="px-10 py-8">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl ${
                    index === 0 ? 'bg-amber-400 text-slate-900' : 
                    index === 1 ? 'bg-slate-300 text-slate-900' : 
                    index === 2 ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-4">
                    <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-12 h-12 rounded-2xl bg-black border border-white/10" alt="" />
                    <div>
                      <div className="text-base font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight uppercase">{user.name}</div>
                      <div className="text-[9px] text-slate-500 font-bold mono uppercase tracking-widest">{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 font-black text-slate-400 mono text-base">{user.bottles} Units</td>
                <td className="px-10 py-8 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-white tracking-tighter mono">
                      {user.points.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Points</span>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-32 text-center text-slate-700 font-black uppercase tracking-widest text-xs">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardView;
