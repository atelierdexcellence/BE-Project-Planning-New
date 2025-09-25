import React, { useState } from 'react';
import { AuthContext, useAuthHook } from './hooks/useAuth';
import { LanguageContext, useLanguageHook } from './hooks/useLanguage';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { MeetingsView } from './views/MeetingsView';
import { ProjectsView } from './views/ProjectsView';

function App() {
  const authHook = useAuthHook();
  const languageHook = useLanguageHook();
  const [activeView, setActiveView] = useState('meetings');

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
      case 'meetings':
        return <MeetingsView />;
      case 'projects':
        return <ProjectsView />;
      default:
        return <MeetingsView />;
    }
  };

  return (
    <AuthContext.Provider value={authHook}>
      <LanguageContext.Provider value={languageHook}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header activeView={activeView} onViewChange={setActiveView} />
          <div className="flex-1 overflow-hidden">
            {renderView()}
          </div>
        </div>
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;