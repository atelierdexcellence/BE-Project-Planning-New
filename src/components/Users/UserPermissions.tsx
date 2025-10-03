import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Check, AlertTriangle } from 'lucide-react';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member' | 'commercial' | 'atelier';
  initials: string;
  department: string;
  phone?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  projects: number;
  hoursThisMonth: number;
}

interface UserPermissionsProps {
  user: ExtendedUser;
  onSave: (permissions: string[]) => void;
  onCancel: () => void;
}

// Define available permissions by category
const PERMISSION_CATEGORIES = {
  'Projects': [
    { id: 'projects.read', name: 'View Projects', description: 'Can view project details and timelines' },
    { id: 'projects.write', name: 'Edit Projects', description: 'Can create and modify projects' },
    { id: 'projects.delete', name: 'Delete Projects', description: 'Can delete projects' },
    { id: 'projects.export', name: 'Export Projects', description: 'Can export project data' }
  ],
  'Tasks': [
    { id: 'tasks.read', name: 'View Tasks', description: 'Can view task details and progress' },
    { id: 'tasks.manage', name: 'Manage Tasks', description: 'Can create, edit, and assign tasks' },
    { id: 'tasks.complete', name: 'Complete Tasks', description: 'Can mark tasks as completed' }
  ],
  'Users': [
    { id: 'users.read', name: 'View Users', description: 'Can view user profiles and information' },
    { id: 'users.manage', name: 'Manage Users', description: 'Can create, edit, and delete users' },
    { id: 'users.permissions', name: 'Manage Permissions', description: 'Can modify user permissions' }
  ],
  'Analytics': [
    { id: 'analytics.read', name: 'View Analytics', description: 'Can access analytics and reports' },
    { id: 'analytics.export', name: 'Export Reports', description: 'Can export analytics data' }
  ],
  'System': [
    { id: 'system.settings', name: 'System Settings', description: 'Can modify system configuration' },
    { id: 'system.backup', name: 'Backup & Restore', description: 'Can perform system backups' },
    { id: 'system.logs', name: 'View Logs', description: 'Can access system logs' }
  ],
  'Commercial': [
    { id: 'clients.manage', name: 'Manage Clients', description: 'Can create and edit client information' },
    { id: 'orders.create', name: 'Create Orders', description: 'Can create new orders' },
    { id: 'orders.manage', name: 'Manage Orders', description: 'Can edit and track orders' }
  ]
};

// Role-based permission presets
const ROLE_PRESETS = {
  admin: ['*'], // All permissions
  team_member: ['projects.read', 'projects.write', 'tasks.read', 'tasks.manage', 'tasks.complete', 'analytics.read'],
  commercial: ['projects.read', 'clients.manage', 'orders.create', 'orders.manage', 'analytics.read'],
  atelier: ['projects.read', 'tasks.read', 'tasks.complete']
};

export const UserPermissions: React.FC<UserPermissionsProps> = ({ user, onSave, onCancel }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [hasAllPermissions, setHasAllPermissions] = useState(false);

  useEffect(() => {
    setSelectedPermissions(user.permissions);
    setHasAllPermissions(user.permissions.includes('*'));
  }, [user.permissions]);

  const handlePermissionToggle = (permissionId: string) => {
    if (hasAllPermissions) return; // Can't modify individual permissions when user has all permissions

    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleAllPermissionsToggle = () => {
    if (hasAllPermissions) {
      setHasAllPermissions(false);
      setSelectedPermissions(ROLE_PRESETS[user.role] || []);
    } else {
      setHasAllPermissions(true);
      setSelectedPermissions(['*']);
    }
  };

  const handleRolePreset = () => {
    const preset = ROLE_PRESETS[user.role] || [];
    setSelectedPermissions(preset);
    setHasAllPermissions(preset.includes('*'));
  };

  const handleSave = () => {
    onSave(selectedPermissions);
  };

  const isPermissionSelected = (permissionId: string) => {
    return hasAllPermissions || selectedPermissions.includes(permissionId);
  };

  const getPermissionCount = () => {
    if (hasAllPermissions) return 'All permissions';
    return `${selectedPermissions.length} permissions selected`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              Manage Permissions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {user.name} • {user.role.replace('_', ' ')} • {getPermissionCount()}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAllPermissionsToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  hasAllPermissions
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {hasAllPermissions ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Remove All Permissions</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Grant All Permissions</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRolePreset}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Apply {user.role.replace('_', ' ')} Preset</span>
              </button>
            </div>
          </div>

          {/* All Permissions Warning */}
          {hasAllPermissions && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Administrator Access</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This user has full administrative access to all system features and data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permission Categories */}
          <div className="space-y-6">
            {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
              <div key={category} className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">{category}</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                          isPermissionSelected(permission.id)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } ${hasAllPermissions ? 'opacity-50' : 'cursor-pointer'}`}
                        onClick={() => !hasAllPermissions && handlePermissionToggle(permission.id)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isPermissionSelected(permission.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {isPermissionSelected(permission.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {hasAllPermissions ? (
              <span className="text-red-600 font-medium">⚠️ Full administrative access granted</span>
            ) : (
              <span>{selectedPermissions.length} permissions selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
