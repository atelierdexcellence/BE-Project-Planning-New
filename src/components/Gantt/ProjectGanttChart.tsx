import React, { useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, User, Settings } from 'lucide-react';
import type { Project, Task } from '../../types';
import { BE_TEAM_MEMBERS } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface ProjectGanttChartProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onManageTasks: () => void;
}

export const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ 
  project, 
  tasks,
  onBack,
  onManageTasks
}) => {
  const { t } = useLanguage();
  const { timeScale, startDate, endDate } = useMemo(() => {
    const projectStart = new Date(project.key_dates.start_in_be);
    const projectEnd = new Date(project.key_dates.last_call);
    
    // Add some padding to the timeline
    const startDate = new Date(projectStart);
    startDate.setDate(startDate.getDate() - 7);
    
    const endDate = new Date(projectEnd);
    endDate.setDate(endDate.getDate() + 7);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeScale = [];
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      timeScale.push(date);
    }
    
    return { timeScale, startDate, endDate };
  }, [project]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    
    const startOffset = Math.max(0, Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return { startOffset, duration };
  };

  const getPhaseColor = (phase: Task['phase']) => {
    return phase === 'pre_prod' ? '#8B5CF6' : '#3B82F6';
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      pending: '#6B7280',
      in_progress: '#3B82F6',
      completed: '#10B981',
      blocked: '#EF4444'
    };
    return colors[status];
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const beTeamMembers = BE_TEAM_MEMBERS.filter(m => project.be_team_member_ids.includes(m.id));

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('gantt.back_overview')}</span>
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {project.client} • {project.bc_order_number} • {beTeamMembers.map(m => m.name.split(' ')[0]).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onManageTasks}
              className="flex items-center space-x-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>{t('gantt.manage_tasks')}</span>
            </button>
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.key_dates.start_in_be).toLocaleDateString('fr-FR')} - {new Date(project.key_dates.last_call).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{project.hours_completed}h / {project.hours_previewed}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-80 p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-900">
              {t('gantt.task_phase')}
            </div>
            <div className="flex-1 flex">
              {timeScale.map((date, index) => {
                const isWeekendDay = isWeekend(date);
                const showWeek = date.getDay() === 1 || index === 0;
                
                return (
                  <div
                    key={index}
                    className={`w-4 border-r border-gray-100 ${
                      isWeekendDay ? 'bg-gray-100' : 'bg-white'
                    }`}
                    title={date.toDateString()}
                  >
                    {showWeek && (
                      <div className="text-xs text-gray-600 p-1 writing-mode-vertical">
                        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Dates Row */}
          <div className="flex border-b border-gray-200 bg-blue-50">
            <div className="w-80 p-4 border-r border-gray-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{t('gantt.key_dates')}</span>
              </div>
            </div>
            <div className="flex-1 relative flex">
              {timeScale.map((date, index) => {
                const isWeekendDay = isWeekend(date);
                return (
                  <div
                    key={index}
                    className={`w-4 border-r border-gray-100 h-12 ${
                      isWeekendDay ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  />
                );
              })}
              
              {/* Key Date Markers */}
              {Object.entries(project.key_dates).map(([key, dateStr]) => {
                const date = new Date(dateStr);
                const dayOffset = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (dayOffset >= 0 && dayOffset < timeScale.length) {
                  return (
                    <div
                      key={key}
                      className="absolute top-1/2 transform -translate-y-1/2 w-2 h-8 bg-red-500 rounded"
                      style={{ left: `${dayOffset * 16}px` }}
                      title={`${key.replace('_', ' ')}: ${date.toLocaleDateString('fr-FR')}`}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Task Rows */}
          {tasks.map((task) => {
            const { startOffset, duration } = getTaskPosition(task);
            const phaseColor = getPhaseColor(task.phase);
            const statusColor = getStatusColor(task.status);
            const assignee = BE_TEAM_MEMBERS.find(m => m.id === task.assignee_id);
            
            return (
              <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                <div className="w-80 p-4 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phaseColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          task.phase === 'pre_prod' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.phase.replace('_', '-')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {assignee && (
                        <div className="flex items-center space-x-1 mt-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{assignee.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 relative flex">
                  {timeScale.map((date, index) => {
                    const isWeekendDay = isWeekend(date);
                    return (
                      <div
                        key={index}
                        className={`w-4 border-r border-gray-100 h-20 ${
                          isWeekendDay ? 'bg-gray-50' : 'bg-white'
                        }`}
                      />
                    );
                  })}
                  
                  {/* Task Bar */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded flex items-center"
                    style={{
                      left: `${startOffset * 16}px`,
                      width: `${duration * 16}px`,
                      backgroundColor: statusColor,
                      opacity: 0.8
                    }}
                  >
                    <div className="text-xs text-white px-2 truncate">
                      {task.progress}%
                    </div>
                    {/* Progress overlay */}
                    <div
                      className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t('gantt.no_tasks')}</p>
                <p className="text-sm mt-1">{t('gantt.tasks_appear')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};