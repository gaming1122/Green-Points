
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Gender } from '../types';

interface UserManagementViewProps {
  currentUser: UserProfile;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  
  // Notice Modal States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [noticeText, setNoticeText] = useState('');

  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [empPass, setEmpPass] = useState('');
  const [empGender, setEmpGender] = useState<Gender>('MALE');

  const loadData = () => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const userList = Object.values(db.USER || {}).map((entry: any) => entry.profile);
    const empList = Object.values(db.EMPLOYEE || {}).map((entry: any) => entry.profile);
    setStudents(userList as UserProfile[]);
    setEmployees(empList as UserProfile[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBanToggle = (uid: string, role: UserRole) => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    if (db[role] && db[role][uid]) {
      const currentStatus = db[role][uid].profile.isBanned;
      db[role][uid].profile.isBanned = !currentStatus;
      localStorage.setItem('gp_database', JSON.stringify(db));
      loadData();
    }
  };

  const openNoticeModal = (user: UserProfile) => {
    setSelectedUser(user);
    setNoticeText(user.notice || '');
    setShowNoticeModal(true);
  };

  const sendNotice = () => {
    if (!selectedUser) return;
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    
    // Update the profile in the correct role bucket
    if (db[selectedUser.role] && db[selectedUser.role][selectedUser.id]) {
      db[selectedUser.role][selectedUser.id].profile.notice = noticeText;
      localStorage.setItem('gp_database', JSON.stringify(db));
      loadData();
      setShowNoticeModal(false);
      setSelectedUser(null);
      setNoticeText('');
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    
    const inputId = empId.trim().toLowerCase();
    if (db.EMPLOYEE[inputId] || db.USER[inputId] || db.ADMIN[inputId]) {
      alert("Conflict: Identity handle already active in the network.");
      return;
    }

    const newEmp: UserProfile = {
      id: inputId,
      name: empName,
      role: 'EMPLOYEE',
      gender: empGender,
      points: 0,
      bottles: 0,
      joinedAt: new Date().toISOString()
    };

    db.EMPLOYEE[inputId] = { password: empPass, profile: newEmp };
    localStorage.setItem('gp_database', JSON.stringify(db));
    
    setEmpId(''); setEmpName(''); setEmpPass('');
    setShowAddEmployee(false);
    loadData();
  };

  const isSuperAdmin = currentUser.id === '2251161030';
  
  const filteredItems = [...students, ...employees].filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 pb-20">
      
      {/* PROFESSIONAL NOTICE MODAL */}
      {showNoticeModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-[#0f1115] w-full max-w-xl rounded-[3rem] border border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Dispatch Notice</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Target Node: {selectedUser.name} ({selectedUser.id})</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <textarea 
                      value={noticeText} 
                      onChange={(e) => setNoticeText(e.target.value)} 
                      placeholder="Compose network alert message..." 
                      className="w-full h-48 bg-black/40 border border-white/5 rounded-3xl p-8 text-white text-sm outline-none focus:border-emerald-500/50 transition-all font-medium leading-relaxed resize-none"
                    />
                    <div className="absolute top-4 right-4 text-[8px] font-black text-slate-600 uppercase tracking-widest mono">AES-256 Broadcaster</div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowNoticeModal(false)} 
                      className="flex-1 py-5 bg-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-3xl hover:bg-white/10 transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      onClick={sendNotice} 
                      className="flex-1 py-5 bg-emerald-500 text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-3xl hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      Transmit Broadcast
                    </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="w-full md:w-96 relative group">
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-emerald-500"></i>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search Global Node IDs..." 
            className="w-full bg-[#0f1115] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold glass text-white outline-none focus:border-emerald-500/30 transition-all" 
          />
        </div>
        
        {isSuperAdmin && (
          <button 
            onClick={() => setShowAddEmployee(!showAddEmployee)} 
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl flex items-center gap-3 transition-all active:scale-95"
          >
            <i className={`fas ${showAddEmployee ? 'fa-times' : 'fa-user-tie'}`}></i>
            <span>{showAddEmployee ? 'Close Panel' : 'Enroll Personnel'}</span>
          </button>
        )}
      </div>

      {/* PERSONNEL REGISTRATION (Super Admin Only) */}
      {showAddEmployee && isSuperAdmin && (
        <div className="bg-[#0f1115] p-12 rounded-[3.5rem] border border-indigo-500/20 glass animate-in zoom-in-95 duration-500">
           <h3 className="text-2xl font-black text-white mb-10 uppercase tracking-tighter">Personnel Authorization Interface</h3>
           <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Full Legal Name" className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-indigo-500/50" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Entity ID</label>
                <input type="text" value={empId} onChange={e => setEmpId(e.target.value)} placeholder="Personnel-ID" className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-indigo-500/50" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Network Password</label>
                <input type="password" value={empPass} onChange={e => setEmpPass(e.target.value)} placeholder="••••" className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-white font-bold tracking-[0.4em] outline-none focus:border-indigo-500/50" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Modality</label>
                <div className="flex space-x-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  <button type="button" onClick={() => setEmpGender('MALE')} className={`flex-1 py-3.5 rounded-xl transition-all text-xl flex items-center justify-center ${empGender === 'MALE' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                    <i className="fas fa-mars"></i>
                  </button>
                  <button type="button" onClick={() => setEmpGender('FEMALE')} className={`flex-1 py-3.5 rounded-xl transition-all text-xl flex items-center justify-center ${empGender === 'FEMALE' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                    <i className="fas fa-venus"></i>
                  </button>
                </div>
              </div>
              <button type="submit" className="md:col-span-2 w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] hover:bg-indigo-500 shadow-2xl transition-all active:scale-[0.98]">Confirm Personnel Enrollment</button>
           </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-[#0f1115] rounded-[3.5rem] border border-white/5 glass p-10 overflow-hidden shadow-2xl">
        <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-10 flex items-center">
          <i className="fas fa-database mr-4 text-emerald-500"></i> Entity Directory
        </h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-600 uppercase tracking-widest mono border-b border-white/5">
                <th className="pb-8 px-6">Profile</th>
                <th className="pb-8 px-6 text-center">Auth Level</th>
                <th className="pb-8 px-6 text-center">Status</th>
                <th className="pb-8 px-6 text-center">XP Hub</th>
                <th className="pb-8 px-6 text-right">Node Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(user => (
                <tr key={user.id} className={`group hover:bg-white/[0.02] transition-colors ${user.isBanned ? 'opacity-40 grayscale' : ''}`}>
                  <td className="py-6 px-6">
                    <div className="flex items-center space-x-4">
                      <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-12 h-12 rounded-2xl bg-[#05070a] border border-white/5 object-cover" alt="" />
                      <div>
                        <div className="text-sm font-black text-white tracking-tight">{user.name}</div>
                        <div className="text-[9px] text-slate-500 font-bold mono uppercase tracking-widest">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest ${
                      user.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 
                      (user.role === 'EMPLOYEE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10')
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${user.isBanned ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {user.isBanned ? 'Suspended' : 'Synced'}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center font-black text-white mono text-sm">{user.points.toLocaleString()}</td>
                  <td className="py-6 px-6 text-right space-x-2">
                    <button 
                      onClick={() => openNoticeModal(user)} 
                      title="Send Network Notice"
                      className="w-11 h-11 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                    >
                      <i className="fas fa-comment-dots"></i>
                    </button>
                    {user.id !== '2251161030' && (
                      <button 
                        onClick={() => handleBanToggle(user.id, user.role)} 
                        title={user.isBanned ? "Revoke Suspension" : "Lock Node"}
                        className={`w-11 h-11 rounded-2xl transition-all shadow-lg ${user.isBanned ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                      >
                        <i className={`fas ${user.isBanned ? 'fa-user-check' : 'fa-user-lock'}`}></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-slate-700 font-black uppercase tracking-widest text-xs">No active network nodes identified.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;
