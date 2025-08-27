import React from 'react';
import { Bell, User, LogOut, Calendar, Globe, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../hooks/useLanguage';

interface HeaderProps {
  onNotificationsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationsClick }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(user?.id || '');
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/PHOTO-2023-09-13-11-16-45 copy.jpg" 
              alt="Atelier d'Excellence" 
              className="h-12 w-auto"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t('header.title')}</h1>
            <p className="text-sm text-gray-500">{t('header.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 text-sm ${
                language === 'fr'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-l-md`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-r-md`}
            >
              EN
            </button>
          </div>

          <button
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
              {user?.initials}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};