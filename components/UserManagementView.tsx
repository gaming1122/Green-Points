
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
  
  // Notice Modal State
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, role: UserRole} | null>(null);
  const [noticeText, setNoticeText] = useState('');

  // New Employee Form
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
    setSelectedUser({ id: user.id, name: user.name, role: user.role });
    setNoticeText(user.notice || '');
    setShowNoticeModal(true);
  };

  const sendNotice = () => {
    if (!selectedUser) return;
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
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
    
    if (db.EMPLOYEE[empId] || db.USER[empId]) {
      alert("ID already exists.");
      return;
    }

    const newEmp: UserProfile = {
      id: empId,
      name: empName,
      role: 'EMPLOYEE',
      gender: empGender,
      points: 0,
      bottles: 0,
      joinedAt: new Date().toISOString()
    };

    db.EMPLOYEE[empId] = { password: empPass, profile: newEmp };
    localStorage.setItem('gp_database', JSON.stringify(db));
    
    setEmpId(''); setEmpName(''); setEmpPass('');
    setShowAddEmployee(false);
    loadData();
  };

  const allModifiable = [...students, ...employees].filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 pb-20">
      
      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#0f1115] w-full max-w-xl rounded-[3rem] border border-emerald-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Broadcast Notice</h3>
                  <button onClick={() => setShowNoticeModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.name}`} className="w-10 h-10 rounded-xl bg-black" alt="" />
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recipient Node</p>
                    <p className="text-sm font-bold text-white uppercase">{selectedUser?.name} ({selectedUser?.id})</p>
                  </div>
                </div>
                <textarea 
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="Enter notice message to be displayed on student portal..."
                  className="w-full h-48 bg-black/50 border border-white/5 rounded-[2rem] p-6 text-white text-sm outline-none focus:border-emerald-500/50 transition-all custom-scrollbar resize-none"
                />
                <div className="mt-8 flex space-x-4">
                  <button onClick={() => setShowNoticeModal(false)} className="flex-1 py-4 bg-white/5 text-slate-500 font-black uppercase tracking-widest rounded-2xl hover:bg-white/10">Cancel</button>
                  <button onClick={sendNotice} className="flex-1 py-4 bg-emerald-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all">Emit Signal</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="w-full md:w-96 relative group">
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"></i>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter identity cluster..." 
            className="w-full bg-[#0f1115] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-emerald-500/50 glass transition-all text-white"
          />
        </div>

        {currentUser.role === 'ADMIN' && (
          <button 
            onClick={() => setShowAddEmployee(!showAddEmployee)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl flex items-center space-x-3"
          >
            <i className={`fas ${showAddEmployee ? 'fa-times' : 'fa-user-plus'}`}></i>
            <span>{showAddEmployee ? 'Cancel' : 'Initialize Employee'}</span>
          </button>
        )}
      </div>

      {showAddEmployee && currentUser.role === 'ADMIN' && (
        <div className="bg-[#0f1115] p-8 md:p-12 rounded-[3rem] border border-indigo-500/30 glass animate-in zoom-in-95 duration-500">
           <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">New Personnel Record</h3>
           <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Full Legal Name</label>
                <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Full Name" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Personnel ID</label>
                <input type="text" value={empId} onChange={e => setEmpId(e.target.value)} placeholder="ID Code" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Security PIN</label>
                <input type="password" value={empPass} onChange={e => setEmpPass(e.target.value)} placeholder="Password" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Gender Modality</label>
                <div className="flex space-x-3 bg-black/40 p-1 rounded-2xl border border-white/5">
                  <button type="button" onClick={() => setEmpGender('MALE')} className={`flex-1 py-3 rounded-xl transition-all ${empGender === 'MALE' ? 'bg-indigo-500 text-white' : 'text-slate-600'}`}>Male</button>
                  <button type="button" onClick={() => setEmpGender('FEMALE')} className={`flex-1 py-3 rounded-xl transition-all ${empGender === 'FEMALE' ? 'bg-rose-500 text-white' : 'text-slate-600'}`}>Female</button>
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full py-5 bg-emerald-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-400 transition-all">Commit Personnel Data</button>
              </div>
           </form>
        </div>
      )}

      {/* Node Directory Table */}
      <div className="bg-[#0f1115] rounded-[3rem] border border-white/5 glass p-10 overflow-hidden relative">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Entity Network Explorer</h3>
          <div className="flex items-center space-x-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{allModifiable.length} Clusters Verified</span>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-600 uppercase tracking-widest mono border-b border-white/5">
                <th className="pb-6 px-4">Entity Hub</th>
                <th className="pb-6 px-4 text-center">Protocol</th>
                <th className="pb-6 px-4 text-center">Standing</th>
                <th className="pb-6 px-4 text-center">XP Pulse</th>
                <th className="pb-6 px-4 text-right">Node Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allModifiable.map(student => (
                <tr key={student.id} className={`group hover:bg-white/5 transition-colors ${student.isBanned ? 'opacity-50' : ''}`}>
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-4">
                      <img src={student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="w-10 h-10 rounded-xl bg-black border border-white/5" alt="" />
                      <div>
                        <div className="text-sm font-black text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold mono">{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${student.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : (student.role === 'EMPLOYEE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')}`}>
                      {student.role}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${student.isBanned ? 'bg-rose-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {student.isBanned ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-center font-black text-white mono">{student.points}</td>
                  <td className="py-6 px-4 text-right space-x-2">
                    <button onClick={() => openNoticeModal(student)} title="Send Notice" className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg">
                      <i className="fas fa-bullhorn text-xs"></i>
                    </button>
                    <button onClick={() => handleBanToggle(student.id, student.role)} title={student.isBanned ? "Revoke Suspension" : "Suspend Node"} className={`w-10 h-10 rounded-xl transition-all shadow-lg ${student.isBanned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}>
                      <i className={`fas ${student.isBanned ? 'fa-unlock' : 'fa-lock'}`}></i>
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

export default UserManagementView;
