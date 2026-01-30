
import React from 'react';
import { ViewType, UserRole } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  role: UserRole;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, role }) => {
  const adminItems = [
    { id: ViewType.DASHBOARD, icon: 'fa-table-columns', label: 'Telemetry', desc: 'System status' },
    { id: ViewType.USER_MANAGEMENT, icon: 'fa-users-gear', label: 'Directory', desc: 'Manage nodes' },
    { id: ViewType.IOT_FIRMWARE, icon: 'fa-microchip', label: 'Hardware', desc: 'IoT logic' },
    { id: ViewType.SYSTEM_LOGS, icon: 'fa-list-ul', label: 'Cloud Logs', desc: 'Traffic stream' },
  ];

  const userItems = [
    { id: ViewType.MY_PROFILE, icon: 'fa-user-circle', label: 'My Wallet', desc: 'Point balance' },
    { id: ViewType.AI_INSIGHTS, icon: 'fa-sparkles', label: 'Neural AI', desc: 'Eco analysis' },
  ];

  const commonItems = [
    { id: ViewType.LEADERBOARD, icon: 'fa-fire', label: 'Top Tiers', desc: 'Global ranking' },
    { id: ViewType.SETTINGS, icon: 'fa-gears', label: 'Settings', desc: 'Config profile' },
  ];

  const activeItems = role === 'ADMIN' ? [...adminItems, ...commonItems] : [...userItems, ...commonItems];
  const themeColor = role === 'ADMIN' ? 'text-indigo-400' : 'text-emerald-500';
  const activeBg = role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-500';

  return (
    <aside className="w-24 md:w-80 bg-[#05070a] border-r border-white/5 flex flex-col transition-all duration-300 relative z-20">
      <div className="p-8 pb-12">
        <div className="flex items-center space-x-4">
          <div className={`${activeBg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl rotate-3`}>
            <i className={`fas ${role === 'ADMIN' ? 'fa-shield-halved' : 'fa-leaf'} ${role === 'ADMIN' ? 'text-white' : 'text-slate-900'} text-2xl`}></i>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-black text-white tracking-tighter leading-none">GP-<span className={themeColor}>{role}</span></h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 mono">Secure Node</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
        {activeItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-3xl transition-all duration-300 group ${
              activeView === item.id 
                ? `${activeBg} text-${role === 'ADMIN' ? 'white' : 'slate-900'} shadow-xl` 
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-2xl ${activeView === item.id ? 'bg-black/10' : 'bg-white/5'}`}>
              <i className={`fas ${item.icon} text-lg`}></i>
            </div>
            <div className="hidden md:block text-left">
              <span className="block font-black text-xs uppercase tracking-widest">{item.label}</span>
              <span className="text-[9px] font-bold opacity-60 block mt-0.5">{item.desc}</span>
            </div>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start space-x-4 px-5 py-5 rounded-3xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-xs uppercase tracking-widest"
        >
          <i className="fas fa-power-off text-lg"></i>
          <span className="hidden md:block">Disconnect Node</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
