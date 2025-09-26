import React from 'react';
import { LogOut, MessageSquare, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'meetings', label: 'Meetings', icon: MessageSquare },
    { id: 'projects', label: 'Projects', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users }
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Meetings Management</h1>
              <p className="text-sm text-gray-500">Project Meeting Tracker</p>
            </div>
          </div>

          <nav className="flex space-x-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
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