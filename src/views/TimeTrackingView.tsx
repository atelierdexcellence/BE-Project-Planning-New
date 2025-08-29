import React, { useState, useMemo } from 'react';
import { Clock, Plus, Calendar, User, Save, X, Bell } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import type { Project, TimeEntry, TaskCategory } from '../types';
import { BE_TEAM_MEMBERS, TASK_CATEGORIES } from '../types';

interface TimeEntryFormData {
  project_id: string;
  hours: number;
  date: string;
  description: string;
  task_category?: TaskCategory;
}

export const TimeTrackingView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, getTimeEntriesForProject, addTimeEntry, updateTimeEntry, deleteTimeEntry } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    project_id: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    task_category: undefined
  });

  // Filter projects to only show those assigned to the current user
  const userProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter(project => 
      project.be_team_member_ids.includes(user.id) &&
      (project.status === 'in_progress' || project.status === 'at_risk' || project.status === 'planning')
    );
  }, [projects, user]);

  // Get all time entries for user's projects
  const allTimeEntries = useMemo(() => {
    if (!user) return [];
    return userProjects.flatMap(project => 
      getTimeEntriesForProject(project.id).filter(entry => entry.user_id === user.id)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userProjects, getTimeEntriesForProject, user]);

  // Get today's entries
  const todayEntries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allTimeEntries.filter(entry => entry.date === today);
  }, [allTimeEntries]);

  // Calculate total hours for today
  const todayHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || formData.hours <= 0 || !formData.project_id) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedUser = BE_TEAM_MEMBERS.find(m => m.id === user.id);
    if (!selectedUser) {
      alert('User not found in BE team members');
      return;
    }

    try {
      await addTimeEntry({
        project_id: formData.project_id,
        user_id: user.id,
        user_name: selectedUser.name,
        ...formData
      });
      
      // Reset form
      setFormData({
        project_id: '',
        hours: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        task_category: undefined
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save time entry:', error);
      alert('Failed to save time entry');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      project_id: '',
      hours: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      task_category: undefined
    });
  };

  // Request notification permission on component mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Set up daily reminder notification
  React.useEffect(() => {
    const scheduleNotification = () => {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(17, 30, 0, 0); // 5:30 PM

      // If it's already past 5:30 PM today, schedule for tomorrow
      if (now > reminderTime) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Time Tracking Reminder', {
            body: 'Don\'t forget to log your hours for today!',
            icon: '/PHOTO-2023-09-13-11-16-45 copy.jpg'
          });
        }
        
        // Schedule the next notification for tomorrow
        scheduleNotification();
      }, timeUntilReminder);
    };

    scheduleNotification();
  }, []);

  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Please log in to track your time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 mr-3 text-blue-600" />
            {t('timetracking.title')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('timetracking.subtitle')} • {userProjects.length} active projects
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{t('timetracking.add_entry')}</span>
        </button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('timetracking.today_hours')}</p>
              <p className="text-2xl font-bold text-gray-900">{todayHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('timetracking.today_entries')}</p>
              <p className="text-2xl font-bold text-gray-900">{todayEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('timetracking.active_projects')}</p>
              <p className="text-2xl font-bold text-gray-900">{userProjects.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            {t('timetracking.add_entry')}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.project')} *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('timetracking.select_project')}</option>
                  {userProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.hours')} * (in 0.25 increments)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2.25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.date')} *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.task_category')}
                </label>
                <select
                  value={formData.task_category || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    task_category: e.target.value as TaskCategory || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('timetracking.select_category')}</option>
                  {TASK_CATEGORIES.filter(category => 
                    ![
                      'reception_mousse', 
                      'decoupe_bois_montage', 
                      'reception_structure_bois', 
                      'mise_en_mousse', 
                      'reception_tissu', 
                      'confection', 
                      'tapisserie'
                    ].includes(category.id)
                  ).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.id === 'general' ? t('task.general') : 
                        `${category.phase === 'pre_prod' ? 'Pre-Prod: ' : 'Prod: '}${category.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                      }
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('timetracking.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('timetracking.description_placeholder')}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 inline mr-2" />
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{t('timetracking.save_entry')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Time Entries */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {t('timetracking.recent_entries')} ({allTimeEntries.length})
          </h3>
        </div>
        
        <div className="p-6">
          {allTimeEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t('timetracking.no_entries')}</p>
              <p className="text-sm mt-1">{t('timetracking.add_first_entry')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTimeEntries.slice(0, 10).map(entry => {
                const project = projects.find(p => p.id === entry.project_id);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(entry.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-blue-600">
                            {entry.hours}h
                          </span>
                        </div>
                        {entry.task_category && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            TASK_CATEGORIES.find(c => c.id === entry.task_category)?.phase === 'pre_prod'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.task_category.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>{project?.name}</strong> - {project?.client}
                      </div>
                      {entry.description && (
                        <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {allTimeEntries.length > 10 && (
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    +{allTimeEntries.length - 10} more entries
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Permission Notice */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                {t('timetracking.enable_notifications')}
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {t('timetracking.notification_description')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};