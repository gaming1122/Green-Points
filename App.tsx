
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Apply Theme Effect
  useEffect(() => {
    if (currentUser?.theme === 'LIGHT') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [currentUser?.theme]);

  // Sync user profile from DB to catch real-time bans/notices
  useEffect(() => {
    const syncWithDb = () => {
      if (currentUser) {
        const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}}');
        const latest = db[currentUser.role]?.[currentUser.id]?.profile;
        if (latest && JSON.stringify(latest) !== JSON.stringify(currentUser)) {
          setCurrentUser(latest);
          localStorage.setItem('gp_active_session', JSON.stringify(latest));
        }
      }
    };

    syncWithDb();
    const interval = setInterval(syncWithDb, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

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

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveView(user.role === 'ADMIN' ? ViewType.DASHBOARD : ViewType.MY_PROFILE);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gp_active_session');
    document.body.classList.remove('light-mode');
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  // Banned UI Overlay
  if (currentUser.isBanned && currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-rose-500/5 border border-rose-500/20 p-12 rounded-[3rem] glass">
          <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(244,63,94,0.4)]">
            <i className="fas fa-user-slash text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Access Revoked</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-10">
            Your identity node has been suspended by the management. Please contact your nearest GreenPoints terminal for verification.
          </p>
          <button onClick={handleLogout} className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
            Return to Login
          </button>
        </div>
      </div>
    );
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
    <div className={`flex h-[100dvh] w-full transition-colors duration-500 overflow-hidden ${currentUser.theme === 'LIGHT' ? 'bg-[#f8fafc]' : 'bg-[#05070a]'}`}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-md" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-[70] transition-transform duration-500 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          activeView={activeView} 
          onViewChange={(view) => { setActiveView(view); setSidebarOpen(false); }} 
          onLogout={handleLogout} 
          role={currentUser.role}
          userName={currentUser.name}
          theme={currentUser.theme || 'DARK'}
        />
      </div>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 relative z-10 w-full custom-scrollbar">
        <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
          <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${currentUser.role === 'ADMIN' ? 'text-indigo-500 bg-indigo-500' : 'text-emerald-500 bg-emerald-500'}`}></div>
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] mono ${currentUser.role === 'ADMIN' ? (currentUser.theme === 'LIGHT' ? 'text-indigo-600' : 'text-indigo-400') : (currentUser.theme === 'LIGHT' ? 'text-emerald-600' : 'text-emerald-500')}`}>
                    {currentUser.role} NODE: ONLINE
                  </p>
                </div>
                <h1 className={`text-xl md:text-5xl font-black tracking-tighter leading-tight uppercase truncate ${currentUser.theme === 'LIGHT' ? 'text-slate-900' : 'text-white'}`}>
                  {activeView.replace('_', ' ')}
                </h1>
              </div>
              
              <button onClick={() => setSidebarOpen(true)} className={`md:hidden ml-4 w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shadow-lg active:scale-90 transition-transform ${currentUser.theme === 'LIGHT' ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'}`}>
                <i className="fas fa-bars-staggered"></i>
              </button>
            </div>
            
            <div className={`flex items-center space-x-3 md:space-x-6 border p-1.5 pr-4 rounded-2xl md:rounded-3xl glass self-end md:self-auto shadow-xl ${currentUser.theme === 'LIGHT' ? 'bg-white/80 border-slate-200' : 'bg-[#0f1115] border-white/5'}`}>
              <img src={displayAvatar} className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 object-cover ${currentUser.theme === 'LIGHT' ? 'border-slate-100 bg-slate-100' : 'border-[#05070a] bg-[#1e293b]'}`} alt="Profile" />
              <div className={`h-6 md:h-8 w-[1px] ${currentUser.theme === 'LIGHT' ? 'bg-slate-200' : 'bg-white/10'}`}></div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] md:text-sm font-bold tracking-wide truncate max-w-[100px] ${currentUser.theme === 'LIGHT' ? 'text-slate-800' : 'text-white'}`}>{currentUser.name}</span>
                <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tighter ${currentUser.role === 'ADMIN' ? (currentUser.theme === 'LIGHT' ? 'text-indigo-600' : 'text-indigo-400') : (currentUser.theme === 'LIGHT' ? 'text-emerald-600' : 'text-emerald-400')}`}>
                  {currentUser.id}
                </span>
              </div>
            </div>
          </header>

          <div className="pb-32 md:pb-20 flex-1">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
