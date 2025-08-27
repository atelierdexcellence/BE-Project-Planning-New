import React, { useMemo } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, Calendar, User, Award } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useLanguage } from '../hooks/useLanguage';
import { BE_TEAM_MEMBERS, COMMERCIAL_USERS, ATELIERS } from '../types';
import type { Project } from '../types';

export const OverviewView: React.FC = () => {
  const { projects, tasks, getTotalHoursForProject } = useProjects();
  const { t } = useLanguage();

  const workloadData = useMemo(() => {
    // Calculate workload for BE team members only
    const beWorkload = BE_TEAM_MEMBERS.map(member => {
      const memberProjects = projects.filter(p => p.be_team_member_ids.includes(member.id));
      const totalHours = memberProjects.reduce((sum, p) => sum + p.hours_previewed, 0);
      const completedHours = memberProjects.reduce((sum, p) => sum + getTotalHoursForProject(p.id), 0);
      const activeProjects = memberProjects.filter(p => 
        p.status === 'in_progress' || p.status === 'at_risk' || p.status === 'planning'
      );
      const overdue = memberProjects.filter(p => p.status === 'overdue').length;
      
      return {
        ...member,
        role: 'BE Team',
        projects: memberProjects,
        activeProjects,
        totalHours,
        completedHours,
        overdue,
        utilization: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0
      };
    });

    return beWorkload;
  }, [projects, getTotalHoursForProject]);

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

  const getNextKeyDate = (project: Project) => {
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

  const totalActiveProjects = projects.filter(p => 
    p.status === 'in_progress' || p.status === 'at_risk' || p.status === 'planning'
  ).length;

  const totalOverdueProjects = projects.filter(p => p.status === 'overdue').length;

  // Team member photos (using Pexels stock photos for professional headshots)
  const teamMemberPhotos = {
    // To change photos, replace the URLs below with your team member photos
    // You can either:
    // 1. Upload photos to the /public folder and use: '/photo-filename.jpg'
    // 2. Use external URLs from photo hosting services
    
    'as': 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', // ALEXANDER SMITH (AS)
    'mr': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', // MAËLYS DE LA RUÉE (MR)
    'aq': 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', // ALEXIA QUENTIN (AQ)
    'sr': 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', // STEPHANIE DE RORTHAYS (SR)
    'ld': 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', // LITESH DHUNNOO (LD)
    'ps': 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', // PASCALINE SOLEILHAC (PS)
    'nr': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'  // NICHOLAS RASCO (NR)
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/PHOTO-2023-09-13-11-16-45 copy.jpg" 
            alt="Atelier d'Excellence" 
            className="h-12 w-auto"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{t('overview.title')}</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {t('overview.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('overview.be_team_members')}</p>
              <p className="text-2xl font-bold text-gray-900">{workloadData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('overview.active_projects')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalActiveProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('overview.overdue_projects')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalOverdueProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('overview.avg_utilization')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(workloadData.reduce((sum, w) => sum + w.utilization, 0) / workloadData.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workloadData.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={teamMemberPhotos[member.id as keyof typeof teamMemberPhotos] || "/PHOTO-2023-09-13-11-16-45 copy.jpg"}
                    alt={teamMemberPhotos[member.id as keyof typeof teamMemberPhotos] ? member.name : "Atelier d'Excellence"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const hasCustomPhoto = teamMemberPhotos[member.id as keyof typeof teamMemberPhotos];
                      if (hasCustomPhoto) {
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
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-sm font-medium" style={{ display: 'none' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role} • {member.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{t('overview.capacity')}:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.utilization > 90 ? 'bg-red-100 text-red-800' :
                      member.utilization > 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {member.utilization}%
                    </span>
                  </div>
                  {member.overdue > 0 && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{member.overdue} {t('overview.overdue')}</span>
                    </div>
                  )}
                </div>
              </div>

              {member.role === 'BE Team' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('overview.total_hours')}</p>
                    <p className="text-lg font-semibold text-gray-900">{member.totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('overview.completed')}</p>
                    <p className="text-lg font-semibold text-gray-900">{member.completedHours}h</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  {t('overview.active_projects')} ({member.activeProjects.length})
                </h4>
              </div>

              {member.activeProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('overview.no_active_projects')}</p>
                  <p className="text-xs text-green-600 mt-1">{t('overview.available_assignment')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {member.activeProjects.slice(0, 3).map((project) => {
                    const nextDate = getNextKeyDate(project);
                    const actualHours = getTotalHoursForProject(project.id);
                    const progressPercentage = project.hours_previewed > 0 
                      ? Math.round((actualHours / project.hours_previewed) * 100) 
                      : 0;

                    return (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {project.name}
                            </h5>
                            <p className="text-xs text-gray-500">{project.client}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>

                        {member.role === 'BE Team' && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{t('overview.progress')}</span>
                              <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {nextDate && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{t('overview.next')}: {nextDate.label}</span>
                            <span className="text-gray-900 font-medium">
                              {new Date(nextDate.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {member.activeProjects.length > 3 && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">
                        +{member.activeProjects.length - 3} {t('overview.more_projects')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};