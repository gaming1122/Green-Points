
import React, { useState, useEffect } from 'react';
import { ViewType, UserRole, UserProfile } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import LeaderboardView from './components/LeaderboardView';
import IotSpecView from './components/IotSpecView';
import BackendSpecView from './components/BackendSpecView';
import AiInsights from './components/AiInsights';
import LoginView from './components/LoginView';
import UserManagementView from './components/UserManagementView';
import SystemLogsView from './components/SystemLogsView';
import UserPortalView from './components/UserPortalView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('gp_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Session hydration failed, starting fresh.");
      return null;
    }
  });
  
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);

  // Auto-login logic for QR Scans
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginId = params.get('loginId');
    const role = params.get('role') as UserRole;

    if (loginId && role && !currentUser) {
      try {
        const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
        const record = db[role]?.[loginId];
        
        if (record) {
          window.history.replaceState({}, document.title, window.location.pathname);
          setCurrentUser(record.profile);
          setActiveView(role === 'ADMIN' ? ViewType.DASHBOARD : ViewType.MY_PROFILE);
        }
      } catch (e) {
        console.error("Auto-login error:", e);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gp_active_session', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveView(user.role === 'ADMIN' ? ViewType.DASHBOARD : ViewType.MY_PROFILE);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gp_active_session');
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  const renderView = () => {
    switch (activeView) {
      case ViewType.SETTINGS:
        return <SettingsView user={currentUser} onUpdate={setCurrentUser} />;
      case ViewType.AI_INSIGHTS:
        return <AiInsights />;
      case ViewType.LEADERBOARD:
        return <LeaderboardView />;
      case ViewType.USER_MANAGEMENT:
        return <UserManagementView />;
      case ViewType.SYSTEM_LOGS:
        return <SystemLogsView />;
      case ViewType.IOT_FIRMWARE:
        return <IotSpecView />;
      case ViewType.BACKEND_SPECS:
        return <BackendSpecView />;
      case ViewType.MY_PROFILE:
        return <UserPortalView user={currentUser} onUpdate={setCurrentUser} />;
      case ViewType.DASHBOARD:
        return currentUser.role === 'ADMIN' ? <DashboardView /> : <UserPortalView user={currentUser} onUpdate={setCurrentUser} />;
      default:
        return <DashboardView />;
    }
  };

  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}&top=${currentUser.gender === 'FEMALE' ? 'longHair,hijab,turban' : 'shortHair,frizzle'}`;
  const displayAvatar = currentUser.profileImage || avatarFallback;

  return (
    <div className="flex h-screen bg-[#05070a] overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={handleLogout} 
        role={currentUser.role}
        userName={currentUser.name}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto">
          <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${currentUser.role === 'ADMIN' ? 'text-indigo-500 bg-indigo-500' : 'text-emerald-500 bg-emerald-500'}`}></div>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] mono ${currentUser.role === 'ADMIN' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                  {currentUser.role} NODE: AUTHORIZED
                </p>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                {activeView.replace('_', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 md:space-x-6 bg-[#0f1115] border border-white/5 p-2 pr-4 md:pr-6 rounded-3xl glass self-start md:self-auto">
              <img src={displayAvatar} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-[#05070a] bg-[#1e293b] object-cover" alt="Profile" />
              <div className="h-8 w-[1px] bg-white/10"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs md:text-sm font-bold text-white tracking-wide truncate max-w-[120px]">{currentUser.name}</span>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-tighter ${currentUser.role === 'ADMIN' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  {currentUser.id}
                </span>
              </div>
            </div>
          </header>

          <div className="transition-all duration-500">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
