import React, { useState } from 'react';
import { UserCard } from '../components/Users/UserCard';
import { UserForm } from '../components/Users/UserForm';
import { UserPermissions } from '../components/Users/UserPermissions';
import { Plus, Search, Filter, Users, Shield, Settings, Download, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import type { User } from '../types';

// Extended user type for management
interface ExtendedUser extends User {
  department: string;
  phone?: string;
  photo?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  projects: number;
  hoursThisMonth: number;
}

// Mock extended users data
const MOCK_EXTENDED_USERS: ExtendedUser[] = [
  {
    id: 'as',
    name: 'ALEXANDER SMITH',
    email: 'as@company.com',
    role: 'team_member',
    initials: 'AS',
    department: 'Bureau d\'Études',
    phone: '+33 1 23 45 67 89',
    photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastLogin: '2024-01-26T14:30:00Z',
    status: 'active',
    permissions: ['projects.read', 'projects.write', 'tasks.manage'],
    projects: 3,
    hoursThisMonth: 120
  },
  {
    id: 'mr',
    name: 'MAËLYS DE LA RUÉE',
    email: 'mr@company.com',
    role: 'team_member',
    initials: 'MR',
    department: 'Bureau d\'Études',
    phone: '+33 1 23 45 67 90',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastLogin: '2024-01-26T09:15:00Z',
    status: 'active',
    permissions: ['projects.read', 'projects.write', 'tasks.manage'],
    projects: 2,
    hoursThisMonth: 95
  },
  {
    id: 'virginie',
    name: 'Virginie',
    email: 'virginie@company.com',
    role: 'commercial',
    initials: 'V',
    department: 'Commercial',
    phone: '+33 1 23 45 67 91',
    photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastLogin: '2024-01-25T16:45:00Z',
    status: 'active',
    permissions: ['projects.read', 'clients.manage', 'orders.create'],
    projects: 5,
    hoursThisMonth: 80
  },
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    initials: 'AU',
    department: 'Administration',
    phone: '+33 1 23 45 67 92',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastLogin: '2024-01-26T15:00:00Z',
    status: 'active',
    permissions: ['*'],
    projects: 0,
    hoursThisMonth: 40
  }
];

export const UsersView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<ExtendedUser[]>(MOCK_EXTENDED_USERS);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Check if current user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('common.access_denied')}</h2>
          <p className="text-gray-600">{t('common.admin_required')}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleManagePermissions = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowPermissions(true);
  };

  const handleSaveUser = (userData: any) => {
    if (selectedUser) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
    } else {
      const newUser: ExtendedUser = {
        ...userData,
        id: Date.now().toString(),
        initials: userData.name.split(' ').map((n: string) => n[0]).join(''),
        projects: 0,
        hoursThisMonth: 0
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowUserForm(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleStatusChange = (userId: string, status: 'active' | 'inactive') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      team_member: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      atelier: 'bg-purple-100 text-purple-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('users.subtitle')} • {filteredUsers.length} {t('users.users')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>{t('common.export')}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <Upload className="h-4 w-4" />
            <span>{t('common.import')}</span>
          </button>
          <button
            onClick={() => setShowUserForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('users.add_user')}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('users.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('users.all_roles')}</option>
              <option value="admin">{t('users.admin')}</option>
              <option value="team_member">{t('users.team_member')}</option>
              <option value="commercial">{t('users.commercial')}</option>
              <option value="atelier">{t('users.atelier')}</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('users.all_status')}</option>
            <option value="active">{t('users.active')}</option>
            <option value="inactive">{t('users.inactive')}</option>
            <option value="pending">{t('users.pending')}</option>
          </select>
        </div>

        <div className="flex border border-gray-300 rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-l-md`}
          >
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-r-md`}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Users Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={() => handleEditUser(user)}
              onDelete={() => handleDeleteUser(user.id)}
              onManagePermissions={() => handleManagePermissions(user)}
              onStatusChange={(status) => handleStatusChange(user.id, status)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.department')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('projects.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.last_login')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.photo || "/PHOTO-2023-09-13-11-16-45 copy.jpg"}
                          alt={user.photo ? user.name : "Atelier d'Excellence"}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
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
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-sm font-medium" style={{ display: 'none' }}>
                          {user.initials}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.projects}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : t('users.never')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleManagePermissions(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {t('users.permissions')}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUserForm && (
        <UserForm
          user={selectedUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowUserForm(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showPermissions && selectedUser && (
        <UserPermissions
          user={selectedUser}
          onSave={(permissions) => {
            setUsers(prev => prev.map(u => 
              u.id === selectedUser.id ? { ...u, permissions } : u
            ));
            setShowPermissions(false);
            setSelectedUser(null);
          }}
          onCancel={() => {
            setShowPermissions(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};