import React from 'react';
import { Calendar, FolderOpen, BarChart3, Settings, Users, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { id: 'overview', label: t('nav.overview'), icon: BarChart3 },
    { id: 'gantt', label: t('nav.gantt'), icon: Calendar },
    { id: 'projects', label: t('nav.projects'), icon: FolderOpen },
    { id: 'timetracking', label: t('nav.timetracking'), icon: Clock },
    ...(user?.role === 'admin' ? [
      { id: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
      { id: 'users', label: t('nav.users'), icon: Users },
      { id: 'settings', label: t('nav.settings'), icon: Settings }
    ] : [])
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 md:hidden">
        <div className="flex items-center space-x-3">
          <img 
            src="/PHOTO-2023-09-13-11-16-45 copy.jpg" 
            alt="Atelier d'Excellence" 
            className="h-8 w-auto"
          />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{t('header.title')}</h2>
            <p className="text-xs text-gray-500">{t('header.subtitle')}</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm md:text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};