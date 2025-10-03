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
  percentage_completed?: number;
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
    task_category: undefined,
    percentage_completed: undefined
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
        task_category: undefined,
        percentage_completed: undefined
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
      task_category: undefined,
      percentage_completed: undefined
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
    <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-blue-600" />
            {t('timetracking.title')}
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {t('timetracking.subtitle')} • {userProjects.length} active projects
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('timetracking.add_entry')}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">{t('timetracking.today_hours')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{todayHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">{t('timetracking.today_entries')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{todayEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-600">{t('timetracking.active_projects')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{userProjects.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            {t('timetracking.add_entry')}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.project')} *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  placeholder="e.g., 2.25"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.date')} *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  {t('timetracking.task_category')}
                </label>
                <select
                  value={formData.task_category || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    task_category: e.target.value as TaskCategory || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Project Completion %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage_completed || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    percentage_completed: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  placeholder="Optional: How complete is this project?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Estimate how complete this project is (0-100%)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                {t('timetracking.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                placeholder={t('timetracking.description_placeholder')}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                <X className="h-4 w-4 inline mr-2" />
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
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
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {t('timetracking.recent_entries')} ({allTimeEntries.length})
          </h3>
        </div>
        
        <div className="p-4 md:p-6">
          {allTimeEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm md:text-base">{t('timetracking.no_entries')}</p>
              <p className="text-xs md:text-sm mt-1">{t('timetracking.add_first_entry')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTimeEntries.slice(0, 10).map(entry => {
                const project = projects.find(p => p.id === entry.project_id);
                return (
                  <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                          <span className="text-xs md:text-sm font-medium text-gray-900">
                            {new Date(entry.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                          <span className="text-xs md:text-sm font-medium text-blue-600">
                            {entry.hours}h
                          </span>
                        </div>
                        {entry.task_category && (
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            TASK_CATEGORIES.find(c => c.id === entry.task_category)?.phase === 'pre_prod'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.task_category.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                    {entry.percentage_completed !== undefined && (
                      <div className="flex items-center space-x-1">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${entry.percentage_completed}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-600 font-medium">
                          {entry.percentage_completed}%
                        </span>
                      </div>
                    )}
                        <strong>{project?.name}</strong> - {project?.client}
                      </div>
                      {entry.description && (
                        <p className="text-xs md:text-sm text-gray-500 mt-1">{entry.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {allTimeEntries.length > 10 && (
                <div className="text-center">
                  <span className="text-xs md:text-sm text-gray-500">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center">
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-xs md:text-sm font-medium text-yellow-800">
                {t('timetracking.enable_notifications')}
              </h4>
              <p className="text-xs md:text-sm text-yellow-700 mt-1">
                {t('timetracking.notification_description')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
