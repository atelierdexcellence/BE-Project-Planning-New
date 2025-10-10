import React, { useState } from 'react';
import { Settings, User, Bell, Globe, Palette, Database, Shield, Save, Download, Upload, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, setDefaultLanguage, t } = useLanguage();
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile settings
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      department: '',
      timezone: 'Europe/Paris',
      avatar: ''
    },
    // Notification settings
    notifications: {
      emailNotifications: true,
      projectUpdates: true,
      deadlineReminders: true,
      timeTrackingReminders: true,
      meetingReminders: true,
      weeklyReports: false,
      soundEnabled: true,
      reminderTime: '17:30'
    },
    // Appearance settings
    appearance: {
      theme: 'light',
      language: language,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      compactMode: false,
      showWeekends: true,
      defaultView: 'gantt'
    },
    // System settings (admin only)
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: '2years',
      maintenanceMode: false,
      debugMode: false,
      apiTimeout: 30
    }
  });

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your personal information and preferences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configure email and push notification preferences'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of the application'
    },
    ...(user?.role === 'admin' ? [{
      id: 'system',
      title: 'System Settings',
      icon: Database,
      description: 'Advanced system configuration and maintenance'
    }] : []),
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Password and security settings'
    }
  ];

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));

    // Apply language change immediately
    if (section === 'appearance' && key === 'language') {
      setDefaultLanguage(value);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // In a real app, this would save to the backend
      console.log('Saving settings:', settings);
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bureau-etudes-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedSettings = JSON.parse(event.target?.result as string);
        setSettings(importedSettings);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Invalid settings file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+33 1 23 45 67 89"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={settings.profile.department}
            onChange={(e) => handleSettingChange('profile', 'department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            <option value="Bureau d'Études">Bureau d'Études</option>
            <option value="Commercial">Commercial</option>
            <option value="Administration">Administration</option>
            <option value="Atelier">Atelier</option>
            <option value="Production">Production</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.profile.timezone}
            onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Europe/Paris">Europe/Paris (CET)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Avatar
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
            {user?.initials}
          </div>
          <div>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Upload New Avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleSettingChange('profile', 'avatar', event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size: 2MB</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
        
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Enable Email Notifications', description: 'Receive notifications via email' },
            { key: 'projectUpdates', label: 'Project Updates', description: 'Get notified when projects are updated' },
            { key: 'deadlineReminders', label: 'Deadline Reminders', description: 'Receive reminders for upcoming deadlines' },
            { key: 'timeTrackingReminders', label: 'Time Tracking Reminders', description: 'Daily reminders to log your hours' },
            { key: 'meetingReminders', label: 'Meeting Reminders', description: 'Get notified about upcoming meetings' },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly project summary reports' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Sound & Timing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Reminder Time
            </label>
            <input
              type="time"
              value={settings.notifications.reminderTime}
              onChange={(e) => handleSettingChange('notifications', 'reminderTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Sound Notifications</h4>
              <p className="text-xs text-gray-600">Play sounds for notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.soundEnabled}
                onChange={(e) => handleSettingChange('notifications', 'soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Language
          </label>
          <select
            value={settings.appearance.language}
            onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This will be your default language when you log in. You can still change it anytime using the language toggle in the header.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={settings.appearance.dateFormat}
            onChange={(e) => handleSettingChange('appearance', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (French)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            value={settings.appearance.timeFormat}
            onChange={(e) => handleSettingChange('appearance', 'timeFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">24 Hour (17:30)</option>
            <option value="12h">12 Hour (5:30 PM)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default View
          </label>
          <select
            value={settings.appearance.defaultView}
            onChange={(e) => handleSettingChange('appearance', 'defaultView', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Team Overview</option>
            <option value="gantt">Annual Gantt</option>
            <option value="projects">Projects</option>
            <option value="timetracking">Time Tracking</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Display Options</h3>
        
        <div className="space-y-3">
          {[
            { key: 'compactMode', label: 'Compact Mode', description: 'Use smaller spacing and condensed layouts' },
            { key: 'showWeekends', label: 'Show Weekends in Gantt', description: 'Display weekend columns in Gantt charts' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.appearance[key as keyof typeof settings.appearance] as boolean}
                  onChange={(e) => handleSettingChange('appearance', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Administrator Settings</h4>
            <p className="text-sm text-yellow-700 mt-1">
              These settings affect the entire system. Changes should be made carefully.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <select
            value={settings.system.backupFrequency}
            onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Retention Period
          </label>
          <select
            value={settings.system.dataRetention}
            onChange={(e) => handleSettingChange('system', 'dataRetention', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1year">1 Year</option>
            <option value="2years">2 Years</option>
            <option value="5years">5 Years</option>
            <option value="forever">Forever</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Timeout (seconds)
          </label>
          <input
            type="number"
            min="10"
            max="120"
            value={settings.system.apiTimeout}
            onChange={(e) => handleSettingChange('system', 'apiTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">System Controls</h3>
        
        <div className="space-y-3">
          {[
            { key: 'autoBackup', label: 'Automatic Backups', description: 'Enable automatic system backups' },
            { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put system in maintenance mode (users cannot access)' },
            { key: 'debugMode', label: 'Debug Mode', description: 'Enable detailed logging for troubleshooting' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.system[key as keyof typeof settings.system] as boolean}
                  onChange={(e) => handleSettingChange('system', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-red-800 mb-3">Danger Zone</h4>
        <div className="space-y-3">
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
            Reset All Settings to Default
          </button>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
            Clear All Project Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Security Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Keep your account secure by using a strong password and enabling two-factor authentication.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Password</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          Update Password
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-logout</h4>
              <p className="text-xs text-gray-600">Automatically log out after period of inactivity</p>
            </div>
            <select
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Remember Me</h4>
              <p className="text-xs text-gray-600">Stay logged in on this device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-red-800 mb-3">Active Sessions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Current Session (This Device)</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Chrome on Windows - 192.168.1.100</span>
            <button className="text-red-600 hover:text-red-800 text-xs">Terminate</button>
          </div>
        </div>
        <button className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
          Terminate All Other Sessions
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'system':
        return renderSystemSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-8 w-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account, preferences, and system configuration
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Import Settings</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExportSettings}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Settings</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 min-h-0">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm border p-4 flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-900 mb-4 lg:hidden">Settings Categories</h3>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-start space-x-3 px-3 lg:px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{section.title}</div>
                    <div className="text-xs text-gray-500 mt-1 hidden lg:block">{section.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 lg:p-6 overflow-y-auto min-h-[400px]">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1 hidden lg:block">
              {sections.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
