import React, { useState } from 'react';
import { AuthContext, useAuthHook } from './hooks/useAuth';
import { LanguageContext, useLanguageHook } from './hooks/useLanguage';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { OverviewView } from './views/OverviewView';
import { GanttView } from './views/GanttView';
import { ProjectsView } from './views/ProjectsView';
import { TimeTrackingView } from './views/TimeTrackingView';
import { AnalyticsView } from './views/AnalyticsView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';
import { TeamView } from './views/TeamView';

function App() {
  const authHook = useAuthHook();
  const languageHook = useLanguageHook();
  const [activeView, setActiveView] = useState('overview');

  if (authHook.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authHook.user) {
    return (
      <AuthContext.Provider value={authHook}>
        <LanguageContext.Provider value={languageHook}>
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
      case 'analytics':
        return <AnalyticsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'team':
        return <TeamView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <AuthContext.Provider value={authHook}>
      <LanguageContext.Provider value={languageHook}>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
          <div className="flex-1 overflow-hidden">
            {renderView()}
          </div>
        </div>
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;