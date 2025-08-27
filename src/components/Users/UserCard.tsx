import React from 'react';
import { Mail, Phone, Calendar, Settings, Trash2, Shield, User, Clock, FolderOpen } from 'lucide-react';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member' | 'commercial' | 'atelier';
  initials: string;
  department: string;
  phone?: string;
  photo?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  projects: number;
  hoursThisMonth: number;
}

interface UserCardProps {
  user: ExtendedUser;
  onEdit: () => void;
  onDelete: () => void;
  onManagePermissions: () => void;
  onStatusChange: (status: 'active' | 'inactive') => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onManagePermissions,
  onStatusChange
}) => {
  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      team_member: 'bg-blue-100 text-blue-800 border-blue-200',
      commercial: 'bg-green-100 text-green-800 border-green-200',
      atelier: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'team_member':
        return <User className="h-4 w-4" />;
      case 'commercial':
        return <FolderOpen className="h-4 w-4" />;
      case 'atelier':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={user.photo || "/PHOTO-2023-09-13-11-16-45 copy.jpg"}
            alt={user.photo ? user.name : "Atelier d'Excellence"}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (user.photo) {
                // If custom photo fails, try company logo
                target.src = "/PHOTO-2023-09-13-11-16-45 copy.jpg";
                target.alt = "Atelier d'Excellence";
              } else {
                // If company logo fails, show initials
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
          <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-lg font-medium" style={{ display: 'none' }}>
            {user.initials}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.department}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs rounded-full border ${getRoleColor(user.role)}`}>
            <div className="flex items-center space-x-1">
              {getRoleIcon(user.role)}
              <span className="capitalize">{user.role.replace('_', ' ')}</span>
            </div>
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(user.status)}`}>
          {user.status}
        </span>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <FolderOpen className="h-4 w-4" />
            <span>{user.projects} projects</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{user.hoursThisMonth}h</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{user.phone}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Last login: {formatLastLogin(user.lastLogin)}</span>
        </div>
      </div>

      {/* Permissions Preview */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Permissions ({user.permissions.length})</p>
        <div className="flex flex-wrap gap-1">
          {user.permissions.slice(0, 3).map((permission, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {permission === '*' ? 'All permissions' : permission}
            </span>
          ))}
          {user.permissions.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              +{user.permissions.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStatusChange(user.status === 'active' ? 'inactive' : 'active')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              user.status === 'active'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {user.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onManagePermissions}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
            title="Manage Permissions"
          >
            <Shield className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit User"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};