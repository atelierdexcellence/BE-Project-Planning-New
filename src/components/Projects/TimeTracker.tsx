import React, { useState } from 'react';
import { X, Plus, Clock, User, Calendar, Edit2, Trash2, Save } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import type { Project, TimeEntry, TaskCategory } from '../../types';
import { BE_TEAM_MEMBERS, TASK_CATEGORIES } from '../../types';

interface TimeTrackerProps {
  project: Project;
  onClose: () => void;
}

interface TimeEntryFormData {
  user_id: string;
  hours: number;
  date: string;
  description: string;
  task_category?: TaskCategory;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ project, onClose }) => {
  const { user } = useAuth();
  const { getTimeEntriesForProject, getTotalHoursForProject, addTimeEntry, updateTimeEntry, deleteTimeEntry } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    user_id: project.be_team_member_ids[0] || '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    task_category: undefined
  });

  const timeEntries = getTimeEntriesForProject(project.id);
  const totalHours = getTotalHoursForProject(project.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.hours <= 0) {
      alert('Please enter a valid number of hours');
      return;
    }

    const selectedUser = BE_TEAM_MEMBERS.find(m => m.id === formData.user_id);
    if (!selectedUser) {
      alert('Please select a valid team member');
      return;
    }

    try {
      if (editingEntry) {
        await updateTimeEntry(editingEntry.id, {
          ...formData,
          user_name: selectedUser.name
        });
      } else {
        await addTimeEntry({
          project_id: project.id,
          user_name: selectedUser.name,
          ...formData
        });
      }
      
      // Reset form
      setFormData({
        user_id: project.be_team_member_ids[0] || '',
        hours: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        task_category: undefined
      });
      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to save time entry:', error);
      alert('Failed to save time entry');
    }
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setFormData({
      user_id: entry.user_id,
      hours: entry.hours,
      date: entry.date,
      description: entry.description || '',
      task_category: entry.task_category
    });
    setShowForm(true);
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      try {
        await deleteTimeEntry(entryId);
      } catch (error) {
        console.error('Failed to delete time entry:', error);
        alert('Failed to delete time entry');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
    setFormData({
      user_id: project.be_team_member_ids[0] || '',
      hours: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      task_category: undefined
    });
  };

  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const key = entry.user_id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              Time Tracking - {project.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total Hours: {totalHours}h / {project.hours_previewed}h ({Math.round((totalHours / project.hours_previewed) * 100)}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add Time Entry Button */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Time Tracking Moved
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Time tracking is now available in the main Time Tracking tab for easier daily use. This view shows a summary of logged hours.
                </p>
              </div>
            </div>
          </div>

          {/* Time Entry Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Member *
                    </label>
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BE_TEAM_MEMBERS.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours * (in 0.25 increments)
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
                      Date *
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
                      Task Category
                    </label>
                    <select
                      value={formData.task_category || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        task_category: e.target.value as TaskCategory || undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select task category</option>
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
                          {category.phase === 'pre_prod' ? 'Pre-Prod: ' : 'Prod: '}
                          {category.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the work performed..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingEntry ? 'Update Entry' : 'Add Entry'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Time Entries by Team Member */}
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([userId, entries]) => {
              const teamMember = BE_TEAM_MEMBERS.find(m => m.id === userId);
              const memberTotal = entries.reduce((sum, entry) => sum + entry.hours, 0);
              
              return (
                <div key={userId} className="border border-gray-200 rounded-lg">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{teamMember?.name}</h3>
                          <p className="text-sm text-gray-600">{entries.length} entries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{memberTotal}h</p>
                        <p className="text-sm text-gray-600">
                          {Math.round((memberTotal / totalHours) * 100)}% of total
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {entries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
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
                            {entry.description && (
                              <p className="text-sm text-gray-600">{entry.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit entry"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {timeEntries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No time entries yet</p>
              <p className="text-sm mt-1">Add the first time entry to start tracking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};