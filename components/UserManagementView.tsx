
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const UserManagementView: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    const userList = Object.values(db.USER).map((entry: any) => entry.profile);
    setStudents(userList as UserProfile[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBanToggle = (uid: string) => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    if (db.USER[uid]) {
      const currentStatus = db.USER[uid].profile.isBanned;
      db.USER[uid].profile.isBanned = !currentStatus;
      localStorage.setItem('gp_database', JSON.stringify(db));
      loadData();
    }
  };

  const handleSendNotice = (uid: string) => {
    const msg = prompt("Enter notice message for this user:");
    if (msg === null) return;
    
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
    if (db.USER[uid]) {
      db.USER[uid].profile.notice = msg;
      localStorage.setItem('gp_database', JSON.stringify(db));
      loadData();
      alert(`Notice sent to ${db.USER[uid].profile.name}`);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
        <div className="w-full md:w-96 relative group">
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"></i>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Entities..." 
            className="w-full bg-[#0f1115] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-emerald-500/50 glass transition-all text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredStudents.length > 0 ? filteredStudents.map(user => (
          <UserCard 
            key={user.id} 
            user={user} 
            onBan={() => handleBanToggle(user.id)} 
            onNotice={() => handleSendNotice(user.id)}
          />
        )) : (
          <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-slate-600">
            <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
            <p className="font-black uppercase tracking-widest text-xs">No matching entities found</p>
          </div>
        )}
      </div>

      <div className="bg-[#0f1115] rounded-[3rem] border border-white/5 glass p-10 overflow-hidden relative">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Entity Management Table</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{students.length} Total Nodes</span>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-600 uppercase tracking-widest mono border-b border-white/5">
                <th className="pb-6 px-4">Entity Identity</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Points</th>
                <th className="pb-6 px-4">Active Notice</th>
                <th className="pb-6 px-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map(student => (
                <tr key={student.id} className={`group hover:bg-white/5 transition-colors ${student.isBanned ? 'opacity-50' : ''}`}>
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                        className="w-10 h-10 rounded-xl bg-[#05070a] object-cover" 
                        alt="A" 
                      />
                      <div>
                        <div className="text-sm font-black text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold mono">{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${student.isBanned ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {student.isBanned ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="py-6 px-4 font-black text-white mono">{student.points}</td>
                  <td className="py-6 px-4 text-slate-500 text-[10px] font-bold italic truncate max-w-[200px]">
                    {student.notice || '—'}
                  </td>
                  <td className="py-6 px-4 text-right space-x-2">
                    <button onClick={() => handleSendNotice(student.id)} title="Send Notice" className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                      <i className="fas fa-comment-dots"></i>
                    </button>
                    <button onClick={() => handleBanToggle(student.id)} title={student.isBanned ? "Revoke Suspension" : "Suspend User"} className={`w-9 h-9 rounded-xl transition-all ${student.isBanned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}>
                      <i className={`fas ${student.isBanned ? 'fa-user-check' : 'fa-user-slash'}`}></i>
                    </button>
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

const UserCard: React.FC<{user: UserProfile; onBan: () => void; onNotice: () => void}> = ({user, onBan, onNotice}) => (
  <div className={`bg-[#0f1115] rounded-[2.5rem] border p-8 glass relative overflow-hidden group transition-all duration-500 ${user.isBanned ? 'border-rose-500/30' : 'border-white/5 hover:border-emerald-500/30'}`}>
    {user.isBanned && (
      <div className="absolute top-4 right-4 text-rose-500 animate-pulse">
        <i className="fas fa-shield-halved text-lg"></i>
      </div>
    )}
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className={`absolute inset-0 rounded-full blur-xl transition-all ${user.isBanned ? 'bg-rose-500/20' : 'bg-emerald-500/10 group-hover:blur-2xl'}`}></div>
        <img 
          src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
          alt={user.name} 
          className={`w-24 h-24 rounded-[2rem] border-4 relative z-10 bg-[#05070a] object-cover transition-all ${user.isBanned ? 'border-rose-500/20 grayscale scale-95 opacity-50' : 'border-white/5 group-hover:scale-105'}`} 
        />
      </div>
      <h4 className="text-xl font-black text-white tracking-tighter mb-1 truncate w-full px-2">{user.name}</h4>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 mono">{user.id}</p>
      
      <div className="w-full flex items-center justify-between space-x-3 mt-auto">
        <button onClick={onNotice} className="flex-1 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
          Notice
        </button>
        <button onClick={onBan} className={`flex-1 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
          user.isBanned ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
        }`}>
          {user.isBanned ? 'Activate' : 'Suspend'}
        </button>
      </div>
    </div>
  </div>
);

export default UserManagementView;
