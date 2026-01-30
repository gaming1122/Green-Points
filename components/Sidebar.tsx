
import React from 'react';
import { ViewType, UserRole, AppTheme } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  role: UserRole;
  userName: string;
  theme: AppTheme;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, role, theme }) => {
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
  
  const isLight = theme === 'LIGHT';
  const themeColor = role === 'ADMIN' ? (isLight ? 'text-indigo-600' : 'text-indigo-400') : (isLight ? 'text-emerald-600' : 'text-emerald-500');
  const activeBg = role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-500';

  return (
    <aside className={`w-80 h-full border-r flex flex-col transition-all duration-300 relative z-20 overflow-y-auto ${isLight ? 'bg-white border-slate-200' : 'bg-[#05070a] border-white/5'}`}>
      <div className="p-8 pb-10">
        <div className="flex items-center space-x-4">
          <div className={`${activeBg} w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl rotate-3`}>
            <i className={`fas ${role === 'ADMIN' ? 'fa-shield-halved' : 'fa-leaf'} text-white text-xl`}></i>
          </div>
          <div>
            <h2 className={`text-xl font-black tracking-tighter leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>GP-<span className={themeColor}>{role}</span></h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 mono">Secure Node</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5">
        {activeItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? `${activeBg} text-white shadow-lg shadow-${role === 'ADMIN' ? 'indigo-500/20' : 'emerald-500/20'}` 
                  : `hover:bg-white/5 ${isLight ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`
              }`}
            >
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${isActive ? 'bg-black/10' : (isLight ? 'bg-slate-100' : 'bg-white/5')}`}>
                <i className={`fas ${item.icon} text-base`}></i>
              </div>
              <div className="text-left">
                <span className="block font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                <span className="text-[9px] font-bold opacity-60 block mt-0.5">{item.desc}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[11px] uppercase tracking-widest"
        >
          <i className="fas fa-power-off text-base"></i>
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
