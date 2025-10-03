import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Calendar, Filter, Download, PieChart, Activity } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { BE_TEAM_MEMBERS, COMMERCIAL_USERS, ATELIERS, PROJECT_SUB_CATEGORIES } from '../types';
import type { Project } from '../types';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, timeEntries, getTotalHoursForProject } = useProjects();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'hours' | 'projects' | 'efficiency'>('hours');

  // Check if user has access to analytics
  if (user?.role !== 'admin' && user?.role !== 'team_member') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('common.access_denied')}</h2>
          <p className="text-gray-600">You need appropriate permissions to access analytics.</p>
        </div>
      </div>
    );
  }

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Project status distribution
    const statusDistribution = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Hours by team member
    const hoursByMember = BE_TEAM_MEMBERS.map(member => {
      const memberProjects = projects.filter(p => p.be_team_member_ids.includes(member.id));
      const totalHours = memberProjects.reduce((sum, p) => sum + getTotalHoursForProject(p.id), 0);
      const previewedHours = memberProjects.reduce((sum, p) => sum + p.hours_previewed, 0);
      
      return {
        id: member.id,
        name: member.name.split(' ')[0], // First name only for charts
        fullName: member.name,
        totalHours,
        previewedHours,
        efficiency: previewedHours > 0 ? Math.round((totalHours / previewedHours) * 100) : 0,
        projectCount: memberProjects.length
      };
    });

    // Projects by atelier
    const projectsByAtelier = ATELIERS.map(atelier => {
      const atelierProjects = projects.filter(p => p.atelier === atelier.id);
      const totalHours = atelierProjects.reduce((sum, p) => sum + getTotalHoursForProject(p.id), 0);
      
      return {
        id: atelier.id,
        name: atelier.name,
        projectCount: atelierProjects.length,
        totalHours,
        avgHoursPerProject: atelierProjects.length > 0 ? Math.round(totalHours / atelierProjects.length) : 0
      };
    });

    // Projects by sub-category
    const projectsByCategory = PROJECT_SUB_CATEGORIES.map(category => {
      const categoryProjects = projects.filter(p => p.sub_category === category.id);
      return {
        id: category.id,
        name: category.name,
        projectCount: categoryProjects.length,
        priority: category.priority
      };
    }).sort((a, b) => a.priority - b.priority);

    // Time entries in selected range
    const recentTimeEntries = timeEntries.filter(entry => 
      new Date(entry.date) >= startDate && new Date(entry.date) <= now
    );

    // Daily hours trend (last 30 days)
    const dailyHours = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = timeEntries.filter(entry => entry.date === dateStr);
      const dayHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
      
      dailyHours.push({
        date: dateStr,
        hours: dayHours,
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' })
      });
    }

    return {
      statusDistribution,
      hoursByMember,
      projectsByAtelier,
      projectsByCategory,
      recentTimeEntries,
      dailyHours,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in_progress' || p.status === 'at_risk').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
      avgHoursPerProject: projects.length > 0 ? Math.round(timeEntries.reduce((sum, entry) => sum + entry.hours, 0) / projects.length) : 0
    };
  }, [projects, timeEntries, getTotalHoursForProject, timeRange]);

  const getStatusColor = (status: string) => {
    const colors = {
      planning: '#6B7280',
      in_progress: '#3B82F6',
      at_risk: '#F59E0B',
      overdue: '#EF4444',
      completed: '#10B981',
      on_hold: '#8B5CF6'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const maxHours = Math.max(...analyticsData.hoursByMember.map(m => m.totalHours), 1);
  const maxDailyHours = Math.max(...analyticsData.dailyHours.map(d => d.hours), 1);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            {t('nav.analytics')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Project performance and team productivity insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Hours/Project</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.avgHoursPerProject}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hours">Hours Worked</option>
              <option value="projects">Project Count</option>
              <option value="efficiency">Efficiency %</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {analyticsData.hoursByMember.map((member) => {
              const value = selectedMetric === 'hours' ? member.totalHours :
                           selectedMetric === 'projects' ? member.projectCount :
                           member.efficiency;
              const maxValue = selectedMetric === 'hours' ? maxHours :
                              selectedMetric === 'projects' ? Math.max(...analyticsData.hoursByMember.map(m => m.projectCount)) :
                              100;
              const percentage = (value / maxValue) * 100;
              
              return (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="w-20 text-sm font-medium text-gray-900 truncate">
                    {member.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-semibold text-gray-900 text-right">
                    {value}{selectedMetric === 'hours' ? 'h' : selectedMetric === 'efficiency' ? '%' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Project Status Distribution
          </h3>
          
          <div className="space-y-3">
            {Object.entries(analyticsData.statusDistribution).map(([status, count]) => {
              const percentage = (count / analyticsData.totalProjects) * 100;
              const color = getStatusColor(status);
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Hours Trend */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Daily Hours Trend (Last 30 Days)
        </h3>
        
        <div className="flex items-end space-x-1 h-64 overflow-x-auto">
          {analyticsData.dailyHours.map((day, index) => {
            const height = (day.hours / maxDailyHours) * 200;
            const isWeekend = day.day === 'Sat' || day.day === 'Sun';
            
            return (
              <div key={index} className="flex flex-col items-center space-y-2 min-w-0 flex-shrink-0">
                <div
                  className={`w-6 rounded-t transition-all duration-300 ${
                    isWeekend ? 'bg-gray-400' : 'bg-blue-600'
                  } hover:opacity-80`}
                  style={{ height: `${Math.max(height, 2)}px` }}
                  title={`${day.date}: ${day.hours}h`}
                />
                <div className="text-xs text-gray-500 transform -rotate-45 origin-center whitespace-nowrap">
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>0h</span>
          <span className="text-center">Daily Hours Worked</span>
          <span>{maxDailyHours}h</span>
        </div>
      </div>

      {/* Projects by Category and Atelier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Category */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Projects by Category</h3>
          
          <div className="space-y-3">
            {analyticsData.projectsByCategory.map((category) => {
              const percentage = analyticsData.totalProjects > 0 
                ? (category.projectCount / analyticsData.totalProjects) * 100 
                : 0;
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{category.priority}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {category.name.length > 30 ? `${category.name.substring(0, 30)}...` : category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-6 text-right">
                      {category.projectCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects by Atelier */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Projects by Atelier</h3>
          
          <div className="space-y-4">
            {analyticsData.projectsByAtelier.map((atelier) => {
              const percentage = analyticsData.totalProjects > 0 
                ? (atelier.projectCount / analyticsData.totalProjects) * 100 
                : 0;
              
              return (
                <div key={atelier.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{atelier.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {atelier.projectCount} projects
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{atelier.totalHours}h total</span>
                    <span>{atelier.avgHoursPerProject}h avg/project</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
