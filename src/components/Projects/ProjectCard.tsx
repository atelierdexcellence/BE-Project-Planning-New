import React from 'react';
import { Calendar, Clock, User, Building } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import type { Project } from '../../types';
import { COMMERCIAL_USERS, BE_TEAM_MEMBERS, ATELIERS } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { getTotalHoursForProject } = useProjects();
  
  const getStatusColor = (status: Project['status']) => {
    const colors = {
      planning: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const getNextKeyDate = () => {
    const dates = [
      { label: 'Start in BE', date: project.key_dates.start_in_be },
      { label: 'Wood/Foam Launch', date: project.key_dates.wood_foam_launch },
      { label: 'Previewed Delivery', date: project.key_dates.previewed_delivery },
      { label: 'Last Call', date: project.key_dates.last_call }
    ].map(d => ({ ...d, dateObj: new Date(d.date) }))
     .filter(d => d.dateObj > new Date())
     .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    return dates[0] || null;
  };

  const commercial = COMMERCIAL_USERS.find(c => c.id === project.commercial_id);
  const beTeamMembers = BE_TEAM_MEMBERS.filter(m => project.be_team_member_ids.includes(m.id));
  const atelier = ATELIERS.find(a => a.id === project.atelier);
  const nextDate = getNextKeyDate();

  const actualHours = getTotalHoursForProject(project.id);
  const progressPercentage = Math.round((actualHours / project.hours_previewed) * 100);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Project Image */}
      {project.image_url && (
        <div className="mb-4">
          <img
            src={project.image_url}
            alt={project.name}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{project.client}</p>
          <p className="text-xs text-gray-500 mt-1">{project.bc_order_number}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Commercial: {commercial?.name}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="h-4 w-4" />
          <span>Atelier: {atelier?.name}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>BE Team: {beTeamMembers.map(m => m.name.split(' ')[0]).join(', ')}</span>
        </div>

        {nextDate && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-gray-900 font-medium">Next: {nextDate.label}</span>
            <span className="text-gray-600">
              {new Date(nextDate.date).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{actualHours}h / {project.hours_previewed}h</span>
          <span className="text-blue-600 font-medium">({progressPercentage}%)</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
