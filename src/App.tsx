import React, { useState, createContext } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { NotificationPanel } from './components/Notifications/NotificationPanel';
import { OverviewView } from './views/OverviewView';
import { GanttView } from './views/GanttView';
import { ProjectsView } from './views/ProjectsView';
import { TimeTrackingView } from './views/TimeTrackingView';
import { MeetingsView } from './views/MeetingsView';
import { UsersView } from './views/UsersView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { AdminCapacityView } from './views/AdminCapacityView';
import { useAuthHook, AuthContext } from './hooks/useAuth';
import { useLanguageHook, LanguageContext } from './hooks/useLanguage';
import type { User } from './types';

function App() {
  const auth = useAuthHook();
  const language = useLanguageHook();
  const [activeView, setActiveView] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <AuthContext.Provider value={auth}>
        <LanguageContext.Provider value={language}>
          <LoginForm />
        </LanguageContext.Provider>
      </AuthContext.Provider>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'gantt':
        return <GanttView />;
      case 'projects':
        return <ProjectsView />;
      case 'timetracking':
        return <TimeTrackingView />;
      case 'meetings':
        return <MeetingsView />;
      case 'analytics':
        return (
          <AnalyticsView />
        );
      case 'users':
        return (
          <UsersView />
        );
      case 'settings':
        return <SettingsView />;
      case 'admin-capacity':
        return <AdminCapacityView />;
      default:
        return <GanttView />;
    }
  };

  return (
    <AuthContext.Provider value={auth}>
      <LanguageContext.Provider value={language}>
        <div className="min-h-screen bg-gray-100">
          <Header 
            onNotificationsClick={() => setShowNotifications(true)}
            onMobileMenuClick={() => setShowMobileSidebar(true)}
          />
          
          <div className="flex h-screen pt-16">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar activeView={activeView} onViewChange={setActiveView} />
            </div>
            
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileSidebar(false)} />
                <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
                  <Sidebar 
                    activeView={activeView} 
                    onViewChange={(view) => {
                      setActiveView(view);
                      setShowMobileSidebar(false);
                    }} 
                  />
                </div>
              </div>
            )}
            
            {renderView()}
          </div>

          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;