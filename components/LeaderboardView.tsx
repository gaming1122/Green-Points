
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const LeaderboardView: React.FC = () => {
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const users = Object.values(db.USER).map((entry: any) => entry.profile) as UserProfile[];
    // Sort by points descending
    const sorted = users.sort((a, b) => b.points - a.points);
    setRealUsers(sorted);
  }, []);

  return (
    <div className="bg-[#0f1115] rounded-3xl border border-white/5 glass overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">Global Standings</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time Node Ranking</p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <span className="text-[10px] font-black text-emerald-400 uppercase">{realUsers.length} Nodes</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest mono border-b border-white/5">
              <th className="px-8 py-4">Rank</th>
              <th className="px-8 py-4">Identity</th>
              <th className="px-8 py-4">Items</th>
              <th className="px-8 py-4">Score</th>
              <th className="px-8 py-4 text-right">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {realUsers.length > 0 ? realUsers.map((user, index) => (
              <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                <td className="px-8 py-5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    index === 0 ? 'bg-yellow-500 text-slate-900' : 
                    index === 1 ? 'bg-slate-300 text-slate-900' : 
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-9 h-9 rounded-xl bg-black border border-white/10" alt="P" />
                    <div>
                      <div className="text-sm font-black text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold mono">{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-400 mono">
                  {user.bottles} BTL
                </td>
                <td className="px-8 py-5">
                  <span className="text-emerald-400 font-black text-sm mono">
                    {user.points.toLocaleString()} PTS
                  </span>
                </td>
                <td className="px-8 py-5 text-right text-[10px] font-bold text-slate-600 mono">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                   <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Waiting for node registration...</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardView;
