import React, { useMemo, useState, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, User, Settings, Plus, Trash2 } from 'lucide-react';
import type { Project, Task } from '../../types';
import { BE_TEAM_MEMBERS } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface ProjectGanttChartProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onManageTasks: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

type DragMode = 'move' | 'resize-left' | 'resize-right' | null;

export const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({
  project,
  tasks,
  onBack,
  onManageTasks,
  onUpdateTask,
  onDeleteTask
}) => {
  const { t } = useLanguage();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [originalTaskData, setOriginalTaskData] = useState<{ start: string; end: string } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { timeScale, startDate, endDate, dayWidth } = useMemo(() => {
    const projectStart = new Date(project.key_dates.start_in_be);
    const projectEnd = new Date(project.key_dates.last_call);

    // Add minimal padding to the timeline
    const startDate = new Date(projectStart);
    startDate.setDate(startDate.getDate() - 3);

    const endDate = new Date(projectEnd);
    endDate.setDate(endDate.getDate() + 3);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeScale = [];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      timeScale.push(date);
    }

    // Calculate day width to fit timeline to viewport
    // Assume viewport width minus task name column (320px)
    const availableWidth = typeof window !== 'undefined' ? window.innerWidth - 320 - 48 : 1200;
    const dayWidth = Math.max(8, Math.floor(availableWidth / totalDays));

    return { timeScale, startDate, endDate, dayWidth };
  }, [project]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);

    const startOffset = Math.max(0, Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));

    return { startOffset, duration, left: startOffset * dayWidth, width: duration * dayWidth };
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

  const roundToHalfDay = (days: number) => {
    return Math.round(days * 2) / 2;
  };

  const handleTaskMouseDown = (e: React.MouseEvent, taskId: string, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();

    const task = tasks.find(t => t.id === taskId);
    if (!task || !onUpdateTask) return;

    setDraggedTask(taskId);
    setDragMode(mode);
    setDragStartX(e.clientX);
    setOriginalTaskData({ start: task.start_date, end: task.end_date });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTask || !dragMode || !originalTaskData || !onUpdateTask) return;

    const task = tasks.find(t => t.id === draggedTask);
    if (!task) return;

    const deltaX = e.clientX - dragStartX;
    const deltaDays = roundToHalfDay(deltaX / dayWidth);

    if (dragMode === 'move') {
      const originalStart = new Date(originalTaskData.start);
      const originalEnd = new Date(originalTaskData.end);

      const newStart = new Date(originalStart);
      newStart.setDate(newStart.getDate() + deltaDays);

      const newEnd = new Date(originalEnd);
      newEnd.setDate(newEnd.getDate() + deltaDays);

      onUpdateTask(draggedTask, {
        start_date: newStart.toISOString().split('T')[0],
        end_date: newEnd.toISOString().split('T')[0]
      });
    } else if (dragMode === 'resize-left') {
      const originalStart = new Date(originalTaskData.start);
      const newStart = new Date(originalStart);
      newStart.setDate(newStart.getDate() + deltaDays);

      const endDate = new Date(task.end_date);
      if (newStart < endDate) {
        onUpdateTask(draggedTask, {
          start_date: newStart.toISOString().split('T')[0]
        });
      }
    } else if (dragMode === 'resize-right') {
      const originalEnd = new Date(originalTaskData.end);
      const newEnd = new Date(originalEnd);
      newEnd.setDate(newEnd.getDate() + deltaDays);

      const startDate = new Date(task.start_date);
      if (newEnd > startDate) {
        onUpdateTask(draggedTask, {
          end_date: newEnd.toISOString().split('T')[0]
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedTask(null);
    setDragMode(null);
    setDragStartX(0);
    setOriginalTaskData(null);
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
        <div
          className="min-w-full select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-80 py-2 px-3 bg-gray-50 border-r border-gray-200 text-xs font-medium text-gray-900">
              {t('gantt.task_phase')}
            </div>
            <div className="flex-1 flex">
              {timeScale.map((date, index) => {
                const isWeekendDay = isWeekend(date);
                const showWeek = date.getDay() === 1 || index === 0;

                return (
                  <div
                    key={index}
                    style={{ width: `${dayWidth}px` }}
                    className={`border-r border-gray-100 ${
                      isWeekendDay ? 'bg-gray-100' : 'bg-white'
                    }`}
                    title={date.toDateString()}
                  >
                    {showWeek && (
                      <div className="text-xs text-gray-600 p-1 transform rotate-90 origin-top-left whitespace-nowrap">
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
            <div className="w-80 py-2 px-3 border-r border-gray-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">{t('gantt.key_dates')}</span>
              </div>
            </div>
            <div className="flex-1 relative flex">
              {timeScale.map((date, index) => {
                const isWeekendDay = isWeekend(date);
                return (
                  <div
                    key={index}
                    style={{ width: `${dayWidth}px` }}
                    className={`border-r border-gray-100 h-8 ${
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
                      className="absolute top-1/2 transform -translate-y-1/2 w-1 h-6 bg-red-500 rounded"
                      style={{ left: `${dayOffset * dayWidth}px` }}
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
            const { left, width } = getTaskPosition(task);
            const phaseColor = getPhaseColor(task.phase);
            const statusColor = getStatusColor(task.status);
            const assignee = BE_TEAM_MEMBERS.find(m => m.id === task.assignee_id);

            return (
              <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50 group">
                <div className="w-80 py-1 px-3 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: phaseColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {task.name}
                      </p>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full capitalize ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {assignee && (
                          <span className="text-xs text-gray-500">{assignee.initials}</span>
                        )}
                      </div>
                    </div>
                    {onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 relative flex">
                  {timeScale.map((date, index) => {
                    const isWeekendDay = isWeekend(date);
                    return (
                      <div
                        key={index}
                        style={{ width: `${dayWidth}px` }}
                        className={`border-r border-gray-100 h-10 ${
                          isWeekendDay ? 'bg-gray-50' : 'bg-white'
                        }`}
                      />
                    );
                  })}

                  {/* Task Bar */}
                  {task.start_date && task.end_date && (
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 h-4 rounded flex items-center group/bar ${
                        draggedTask === task.id ? 'opacity-60' : 'opacity-80'
                      }`}
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                        backgroundColor: statusColor,
                        cursor: onUpdateTask ? 'move' : 'default'
                      }}
                    >
                      {/* Left resize handle */}
                      {onUpdateTask && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20"
                          onMouseDown={(e) => handleTaskMouseDown(e, task.id, 'resize-left')}
                        />
                      )}

                      {/* Center drag area */}
                      <div
                        className="flex-1 flex items-center justify-center"
                        onMouseDown={(e) => onUpdateTask && handleTaskMouseDown(e, task.id, 'move')}
                      >
                        <div className="text-xs text-white px-1 truncate">
                          {task.progress}%
                        </div>
                      </div>

                      {/* Right resize handle */}
                      {onUpdateTask && (
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20"
                          onMouseDown={(e) => handleTaskMouseDown(e, task.id, 'resize-right')}
                        />
                      )}

                      {/* Progress overlay */}
                      <div
                        className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded pointer-events-none"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
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
