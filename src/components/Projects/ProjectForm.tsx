import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { TEAM_MEMBERS, Project } from '../../types';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'planning' as Project['status'],
    sub_category: 'seating' as Project['sub_category'],
    color: '#3B82F6',
    bc_order_number: '',
    image_url: '',
    collection_models: '',
    composition: '',
    date_of_brief: '',
    commercial_id: 'virginie',
    atelier: 'paris' as Project['atelier'],
    be_team_member_ids: [] as string[],
    key_dates: {
      start_in_be: '',
      wood_foam_launch: '',
      previewed_delivery: '',
      last_call: ''
    },
    hours_previewed: 0,
    hours_completed: 0,
    pieces: 1,
    size: 'Medium' as Project['size'],
    geometry: 'Square' as Project['geometry'],
    target_cost_constraint: 'Moderate' as Project['target_cost_constraint'],
    modelling: '3D' as Project['modelling'],
    outsourced_suppliers: 0,
    d_level_override: null as number | null,
    d_level: 5,
    description: '',
    teamMembers: [] as string[]
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        client: project.client,
        status: project.status,
        sub_category: project.sub_category,
        color: project.color,
        bc_order_number: project.bc_order_number,
        image_url: project.image_url || '',
        collection_models: project.collection_models || '',
        composition: project.composition || '',
        date_of_brief: project.date_of_brief,
        commercial_id: project.commercial_id,
        atelier: project.atelier,
        be_team_member_ids: project.be_team_member_ids,
        key_dates: project.key_dates,
        hours_previewed: project.hours_previewed,
        hours_completed: project.hours_completed,
        pieces: project.pieces,
        size: project.size,
        geometry: project.geometry,
        target_cost_constraint: project.target_cost_constraint,
        modelling: project.modelling,
        outsourced_suppliers: project.outsourced_suppliers,
        d_level_override: project.d_level_override,
        d_level: project.d_level,
        description: project.description || '',
        teamMembers: project.be_team_member_ids
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }
    
    if (!formData.client.trim()) {
      alert('Client name is required');
      return;
    }
    
    if (!formData.key_dates.start_in_be) {
      alert('Start date is required');
      return;
    }
    
    if (!formData.key_dates.previewed_delivery) {
      alert('End date is required');
      return;
    }
    
    const projectData = {
      ...formData,
      be_team_member_ids: formData.teamMembers
    };
    onSave(projectData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('key_dates.')) {
      const dateField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        key_dates: {
          ...prev.key_dates,
          [dateField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTeamMemberChange = (memberId: string, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: isChecked
        ? [...prev.teamMembers, memberId]
        : prev.teamMembers.filter(id => id !== memberId)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="at_risk">At Risk</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label htmlFor="key_dates.start_in_be" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="key_dates.start_in_be"
                name="key_dates.start_in_be"
                value={formData.key_dates.start_in_be}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="key_dates.previewed_delivery" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="key_dates.previewed_delivery"
                name="key_dates.previewed_delivery"
                value={formData.key_dates.previewed_delivery}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
              {TEAM_MEMBERS.map((member) => (
                <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.teamMembers.includes(member.id)}
                    onChange={(e) => handleTeamMemberChange(member.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{member.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleColor(member.role)}`}>
                    {member.role.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};