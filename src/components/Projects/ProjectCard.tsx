import React from 'react';
import { Calendar, Clock, User, Building } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
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

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {project.image_url && (
            <img
              src={project.image_url}
              alt={project.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{project.client}</p>
          {project.composition && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.composition}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
        {project.bc_order_number && (
          <span className="text-xs text-gray-500 font-mono">{project.bc_order_number}</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Start: {new Date(project.key_dates.start_in_be).toLocaleDateString('fr-FR')}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Delivery: {new Date(project.key_dates.previewed_delivery).toLocaleDateString('fr-FR')}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Team: {project.be_team_member_ids.length} members</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="h-4 w-4" />
          <span>Atelier: {project.atelier}</span>
        </div>
      </div>
    </div>
  );
};