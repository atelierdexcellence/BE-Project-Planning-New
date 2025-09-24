import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Clock } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useProjects } from '../../hooks/useProjects';
import { Project, PROJECT_SUB_CATEGORIES, COMMERCIAL_USERS, BE_TEAM_MEMBERS, ATELIERS } from '../../types';
import { ProjectUpdates } from './ProjectUpdates';
import { TimeTracker } from './TimeTracker';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  onViewGantt?: (project: Project) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
  onViewGantt,
}) => {
  const { t } = useLanguage();
  const { addProjectUpdate, getTotalHoursForProject, timeEntries } = useProjects();
  const [activeTab, setActiveTab] = useState<'details' | 'updates' | 'time'>('details');
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'planning' as Project['status'],
    sub_category: PROJECT_SUB_CATEGORIES[0].id,
    color: '#3B82F6',
    bc_order_number: '',
    image_url: '',
    client: '',
    collection_models: '',
    composition: '',
    date_of_brief: '',
    commercial_id: '',
    atelier: 'siegeair' as const,
    be_team_member_ids: [] as string[],
    key_dates: {
      start_in_be: '',
      wood_foam_launch: '',
      previewed_delivery: '',
      last_call: ''
    },
    hours_previewed: 0,
    hours_completed: 0,
    notes: [] as any[]
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        status: project.status,
        sub_category: project.sub_category,
        color: project.color,
        bc_order_number: project.bc_order_number || '',
        image_url: project.image_url || '',
        client: project.client,
        collection_models: project.collection_models,
        composition: project.composition,
        date_of_brief: project.date_of_brief,
        commercial_id: project.commercial_id,
        atelier: project.atelier,
        be_team_member_ids: project.be_team_member_ids,
        key_dates: project.key_dates,
        hours_previewed: project.hours_previewed,
        hours_completed: project.hours_completed,
        notes: project.notes
      });
    } else {
      setFormData({
        name: '',
        status: 'planning',
        sub_category: PROJECT_SUB_CATEGORIES[0].id,
        color: '#3B82F6',
        bc_order_number: '',
        image_url: '',
        client: '',
        collection_models: '',
        composition: '',
        date_of_brief: '',
        commercial_id: '',
        atelier: 'siegeair',
        be_team_member_ids: [],
        key_dates: {
          start_in_be: '',
          wood_foam_launch: '',
          previewed_delivery: '',
          last_call: ''
        },
        hours_previewed: 0,
        hours_completed: 0,
        notes: []
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one BE team member is selected
    if (formData.be_team_member_ids.length === 0) {
      alert('Please select at least one BE team member');
      return;
    }
    
    // Pass the form data to the parent component
    onSave(formData as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('key_dates.')) {
      const dateKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        key_dates: {
          ...prev.key_dates,
          [dateKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'hours_previewed' || name === 'hours_completed' ? Number(value) : value 
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          image_url: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBeTeamMemberChange = (memberId: string, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      be_team_member_ids: isChecked
        ? [...prev.be_team_member_ids, memberId]
        : prev.be_team_member_ids.filter(id => id !== memberId)
    }));
  };

  const getHeaderTitle = () => {
    if (!project) return 'New Project';
    const bcNumber = formData.bc_order_number || project.bc_order_number;
    return bcNumber ? `${formData.name || project.name}-${bcNumber}` : formData.name || project.name;
  };

  const handleAddUpdate = async (content: string, authorId: string, authorName: string) => {
    if (project) {
      await addProjectUpdate(project.id, content, authorId, authorName);
    }
  };

  const getLatestCompletionPercentage = () => {
    if (!project) return 0;
    
    const projectTimeEntries = timeEntries.filter(entry => entry.project_id === project.id);
    const entriesWithPercentage = projectTimeEntries.filter(entry => entry.percentage_completed !== undefined);
    
    if (entriesWithPercentage.length === 0) return 0;
    
    // Get the most recent entry with percentage
    const latestEntry = entriesWithPercentage.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return latestEntry.percentage_completed || 0;
  };

  const actualHours = project ? getTotalHoursForProject(project.id) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {getHeaderTitle()}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Details
            </button>
            {project && (
              <button
                onClick={() => setActiveTab('time')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'time'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                Time Summary
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {actualHours}h
                </span>
              </button>
            )}
            {project && (
              <button
                onClick={() => setActiveTab('updates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'updates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Updates
                {project.notes && project.notes.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {project.notes.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bc_order_number" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.bc_order')}
                  </label>
                  <input
                    type="text"
                    id="bc_order_number"
                    name="bc_order_number"
                    value={formData.bc_order_number}
                    onChange={handleInputChange}
                    placeholder="e.g., BC003"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="image_file" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="image_file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Select a local image file (JPG, PNG, GIF, etc.)
                    </p>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Project preview"
                        className="w-32 h-24 object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.client')} *
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="collection_models" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.collection')}
                  </label>
                  <input
                    type="text"
                    id="collection_models"
                    name="collection_models"
                    value={formData.collection_models}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="composition" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.composition')}
                  </label>
                  <input
                    type="text"
                    id="composition"
                    name="composition"
                    value={formData.composition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="date_of_brief" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.date_brief')} *
                  </label>
                  <input
                    type="date"
                    id="date_of_brief"
                    name="date_of_brief"
                    value={formData.date_of_brief}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Completion Status
                  </label>
                  <div
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {project ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(getLatestCompletionPercentage(), 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-0">
                          {getLatestCompletionPercentage()}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Completion percentage will be calculated from time entries</span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="sub_category" className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category *
                  </label>
                  <select
                    id="sub_category"
                    name="sub_category"
                    value={formData.sub_category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PROJECT_SUB_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.priority}. {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="commercial_id" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.commercial')} *
                  </label>
                  <select
                    id="commercial_id"
                    name="commercial_id"
                    value={formData.commercial_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Commercial</option>
                    {COMMERCIAL_USERS.map((commercial) => (
                      <option key={commercial.id} value={commercial.id}>
                        {commercial.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="atelier" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.atelier')} *
                  </label>
                  <select
                    id="atelier"
                    name="atelier"
                    value={formData.atelier}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {ATELIERS.map((atelier) => (
                      <option key={atelier.id} value={atelier.id}>
                        {atelier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.be_team')} *
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {BE_TEAM_MEMBERS.map((member) => (
                      <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.be_team_member_ids.includes(member.id)}
                          onChange={(e) => handleBeTeamMemberChange(member.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">{member.name}</span>
                      </label>
                    ))}
                  </div>
                  {formData.be_team_member_ids.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">Please select at least one BE team member</p>
                  )}
                </div>
              </div>

              {/* Key Dates Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('project.key_dates')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="key_dates.start_in_be" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('project.start_be')} *
                    </label>
                    <input
                      type="date"
                      id="key_dates.start_in_be"
                      name="key_dates.start_in_be"
                      value={formData.key_dates.start_in_be}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="key_dates.wood_foam_launch" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('project.wood_foam')} *
                    </label>
                    <input
                      type="date"
                      id="key_dates.wood_foam_launch"
                      name="key_dates.wood_foam_launch"
                      value={formData.key_dates.wood_foam_launch}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="key_dates.previewed_delivery" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('project.delivery')} *
                    </label>
                    <input
                      type="date"
                      id="key_dates.previewed_delivery"
                      name="key_dates.previewed_delivery"
                      value={formData.key_dates.previewed_delivery}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="key_dates.last_call" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('project.last_call')} *
                    </label>
                    <input
                      type="date"
                      id="key_dates.last_call"
                      name="key_dates.last_call"
                      value={formData.key_dates.last_call}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hours Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="hours_previewed" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.hours_previewed')} *
                  </label>
                  <input
                    type="number"
                    id="hours_previewed"
                    name="hours_previewed"
                    value={formData.hours_previewed}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="hours_completed" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.hours_completed')} * (Calculated from time entries)
                  </label>
                  <input
                    type="number"
                    id="hours_completed"
                    name="hours_completed"
                    value={project ? actualHours : formData.hours_completed}
                    onChange={project ? undefined : handleInputChange}
                    min="0"
                    step="0.25"
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      project ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={!!project}
                  />
                  {project && (
                    <p className="mt-1 text-sm text-gray-500">
                      Hours are automatically calculated from time entries. Use the Time Tracking tab to log hours.
                    </p>
                  )}
                </div>
              </div>

              {/* D-Level Display */}
              {project && (project as any).dLevel && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Project D-Level</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Difficulty level calculated by admin
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                        (project as any).dLevel >= 8 ? 'bg-red-100 text-red-800' :
                        (project as any).dLevel >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        (project as any).dLevel >= 4 ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {(project as any).dLevel}
                      </span>
                      {(project as any).dLevelOverride && (
                        <span className="text-xs text-purple-600 font-medium">Override</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {project && onViewGantt && (
                  <button
                    type="button"
                    onClick={() => onViewGantt(project)}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('project.view_gantt')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('project.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {project ? t('project.update') : t('project.create')}
                </button>
              </div>
            </form>
          ) : activeTab === 'time' && project ? (
            <TimeTracker project={project} onClose={() => setActiveTab('details')} />
          ) : (
            project && (
              <ProjectUpdates 
                projectId={project.id}
                updates={project.notes || []}
                onAddUpdate={handleAddUpdate}
              />
            )
          )}
        </div>
      </div>

      {/* Time Tracker Modal */}
      {showTimeTracker && project && (
        <TimeTracker
          project={project}
          onClose={() => setShowTimeTracker(false)}
        />
      )}
    </div>
  );
};