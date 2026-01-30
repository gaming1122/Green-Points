
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const UserManagementView: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const userList = Object.values(db.USER).map((entry: any) => entry.profile);
    setStudents(userList as UserProfile[]);
  }, []);

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
        <div className="w-full md:w-96 relative group">
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Scan Node IDs..." 
            className="w-full bg-[#0f1115] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-emerald-500/50 glass transition-all text-white"
          />
        </div>
        <div className="flex space-x-4">
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-3xl border border-white/5 transition-all">Filter</button>
          <button className="px-8 py-4 bg-emerald-500 text-slate-900 font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">Export JSON</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {students.length > 0 ? students.map(user => (
          <UserCard key={user.id} user={user} />
        )) : (
          <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-slate-600">
            <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
            <p className="font-black uppercase tracking-widest text-xs">No students registered in this node yet</p>
          </div>
        )}
      </div>

      <div className="bg-[#0f1115] rounded-[3rem] border border-white/5 glass p-10 overflow-hidden relative">
        <h3 className="text-2xl font-black text-white tracking-tighter mb-10">Registered Entity Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-600 uppercase tracking-widest mono border-b border-white/5">
                <th className="pb-6 px-4">Entity Identity</th>
                <th className="pb-6 px-4">Points</th>
                <th className="pb-6 px-4">Bottles</th>
                <th className="pb-6 px-4">Registry Date</th>
                <th className="pb-6 px-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map(student => (
                <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&top=${student.gender === 'FEMALE' ? 'longHair,hijab,turban' : 'shortHair,frizzle'}`} 
                        className="w-10 h-10 rounded-xl bg-[#05070a] object-cover" 
                        alt="A" 
                      />
                      <div>
                        <div className="text-sm font-black text-white">{student.name}</div>
                        <div className="text-[10px] text-emerald-500 font-bold mono">{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 font-black text-white mono">{student.points}</td>
                  <td className="py-6 px-4 font-black text-slate-400 mono">{student.bottles}</td>
                  <td className="py-6 px-4 text-slate-500 text-[10px] font-bold mono">{new Date(student.joinedAt).toLocaleDateString()}</td>
                  <td className="py-6 px-4 text-right">
                    <button className="text-slate-600 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserCard: React.FC<{user: UserProfile}> = ({user}) => (
  <div className="bg-[#0f1115] rounded-[2.5rem] border border-white/5 p-8 glass relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
        <img 
          src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&top=${user.gender === 'FEMALE' ? 'longHair,hijab,turban' : 'shortHair,frizzle'}`} 
          alt={user.name} 
          className="w-24 h-24 rounded-[2rem] border-4 border-white/5 relative z-10 bg-[#05070a] object-cover" 
        />
      </div>
      <h4 className="text-xl font-black text-white tracking-tighter mb-1">{user.name}</h4>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 mono">{user.id}</p>
      
      <div className="w-full grid grid-cols-2 gap-4">
        <div className="bg-[#05070a] p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Score</p>
          <p className="text-lg font-black text-emerald-500 tracking-tighter">{user.points}</p>
        </div>
        <div className="bg-[#05070a] p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Items</p>
          <p className="text-lg font-black text-white tracking-tighter">{user.bottles}</p>
        </div>
      </div>
    </div>
  </div>
);

export default UserManagementView;
