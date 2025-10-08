import React, { useMemo, useState, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, User, Settings, Trash2, GripVertical, Link } from 'lucide-react';
import type { Project, Task } from '../../types';
import { BE_TEAM_MEMBERS } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { TaskEditModal } from '../Tasks/TaskEditModal';

interface ProjectGanttChartProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onManageTasks: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onReorderTasks?: (reorderedTasks: Task[]) => void;
}

type DragMode = 'move' | 'resize-left' | 'resize-right' | null;

export const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({
  project,
  tasks,
  onBack,
  onManageTasks,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks
}) => {
  const { t, language } = useLanguage();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [originalTaskData, setOriginalTaskData] = useState<{ start: string; end: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const { timeScale, startDate, endDate } = useMemo(() => {
    // Use project key dates to determine timeline
    const startInBE = new Date(project.key_dates.start_in_be);
    const previewedDelivery = new Date(project.key_dates.previewed_delivery);
    const lastCall = new Date(project.key_dates.last_call);

    // Start date is Start In BE
    const startDate = new Date(startInBE);

    // End date is the later of Previewed Delivery or Last Call
    const endDate = lastCall > previewedDelivery ? new Date(lastCall) : new Date(previewedDelivery);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const timeScale = [];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      timeScale.push(date);
    }

    return { timeScale, startDate, endDate };
  }, [project.key_dates]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);

    // Calculate day width as percentage
    const dayWidth = 100 / timeScale.length;

    // Find exact day indices
    const startDayIndex = timeScale.findIndex(timelineDate =>
      timelineDate.toDateString() === taskStart.toDateString()
    );
    const endDayIndex = timeScale.findIndex(timelineDate =>
      timelineDate.toDateString() === taskEnd.toDateString()
    );

    // If dates are not found in timeline, calculate based on day offset from timeline start
    let startPercentage = 0;
    let endPercentage = 100;

    if (startDayIndex >= 0) {
      startPercentage = startDayIndex * dayWidth;
    } else {
      // Calculate days from timeline start
      const daysFromStart = Math.floor((taskStart.getTime() - timeScale[0].getTime()) / (1000 * 60 * 60 * 24));
      startPercentage = daysFromStart * dayWidth;
    }

    if (endDayIndex >= 0) {
      endPercentage = (endDayIndex * dayWidth) + (dayWidth * 0.5);
    } else {
      // Calculate days from timeline start
      const daysFromStart = Math.floor((taskEnd.getTime() - timeScale[0].getTime()) / (1000 * 60 * 60 * 24));
      endPercentage = (daysFromStart * dayWidth) + (dayWidth * 0.5);
    }

    const widthPercentage = Math.max(dayWidth * 0.5, endPercentage - startPercentage);

    return { startPercentage, widthPercentage, dayWidth };
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
    if (!draggedTask || !dragMode || !originalTaskData || !onUpdateTask || !timelineRef.current) return;

    const task = tasks.find(t => t.id === draggedTask);
    if (!task) return;

    const deltaX = e.clientX - dragStartX;
    const timelineWidth = timelineRef.current.offsetWidth;
    const dayWidth = timelineWidth / timeScale.length;
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

  const handleRowDragStart = (index: number) => {
    setDraggedRowIndex(index);
  };

  const handleRowDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) return;

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedRowIndex];
    newTasks.splice(draggedRowIndex, 1);
    newTasks.splice(index, 0, draggedTask);

    const reorderedTasks = newTasks.map((task, idx) => ({
      ...task,
      order_index: idx
    }));

    if (onReorderTasks) {
      onReorderTasks(reorderedTasks);
    }
    setDraggedRowIndex(index);
  };

  const handleRowDragEnd = () => {
    setDraggedRowIndex(null);
  };

  const handleTaskDoubleClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveTaskEdit = (updates: Partial<Task>) => {
    if (editingTask && onUpdateTask) {
      onUpdateTask(editingTask.id, updates);
      setEditingTask(null);
    }
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
          ref={timelineRef}
          className="min-w-full select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Timeline Header */}
          <div className="border-b border-gray-200 sticky top-0 bg-white z-20 min-w-full">
            {/* Week Numbers Row */}
            <div className="flex border-b border-gray-100">
              {timeScale.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isWeekendDay = isWeekend(date);
                const isMonday = date.getDay() === 1;
                const weekNumber = getWeekNumber(date);

                // Calculate days in this week (for Monday only)
                let daysInWeek = 1;
                if (isMonday) {
                  daysInWeek = 0;
                  for (let i = 0; i < 7 && (index + i) < timeScale.length; i++) {
                    const checkDate = timeScale[index + i];
                    if (checkDate.getDay() === (1 + i) % 7 || (i === 6 && checkDate.getDay() === 0)) {
                      daysInWeek++;
                    } else {
                      break;
                    }
                  }
                }

                // Skip Tuesday-Sunday if they're part of a week that started with Monday
                const isTuesdayToSunday = date.getDay() >= 2 || date.getDay() === 0;
                const mondayIndex = date.getDay() === 0 ? index - 6 : index - (date.getDay() - 1);
                const hasMonday = mondayIndex >= 0 && timeScale[mondayIndex] && timeScale[mondayIndex].getDay() === 1;

                if (isTuesdayToSunday && hasMonday) {
                  return null; // Skip rendering Tuesday-Sunday cells when Monday exists
                }

                return (
                  <div
                    key={index}
                    className={`w-4 border-r border-gray-100 h-6 relative ${
                      isToday ? 'bg-green-500' :
                      isWeekendDay ? 'bg-gray-400 bg-opacity-30' : 'bg-gray-50'
                    }`}
                    style={isMonday ? { flex: daysInWeek } : { flex: 1 }}
                  >
                    {isMonday && (
                      <div className={`text-xs p-1 font-medium text-center leading-none absolute inset-0 flex items-center justify-center ${
                        isToday ? 'text-white font-bold' :
                        'text-gray-700'
                      }`}>
                        {viewMode === 'year'
                          ? (language === 'en' ? `W${weekNumber}` : `S${weekNumber}`)
                          : (language === 'en' ? `W${weekNumber} ${date.getFullYear()}` : `S${weekNumber} ${date.getFullYear()}`)
                        }
                      </div>
                    )}
                  </div>
                );
              }).filter(Boolean)}
            </div>

            {/* Months Row */}
            <div className="flex border-b border-gray-100">
              {timeScale.map((date, index) => {
                const isWeekendDay = isWeekend(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isFirstOfMonth = date.getDate() === 1;
                const monthName = date.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { month: 'short' });

                // Calculate days in this month from current position (only for first of month)
                let daysInMonth = 0;
                if (isFirstOfMonth) {
                  const currentMonth = date.getMonth();
                  for (let i = 0; (index + i) < timeScale.length; i++) {
                    const checkDate = timeScale[index + i];
                    if (checkDate.getMonth() === currentMonth) {
                      daysInMonth++;
                    } else {
                      break;
                    }
                  }
                }

                // Skip non-first-of-month days if they're part of a month that started with first day
                const isNotFirstOfMonth = date.getDate() !== 1;
                const firstOfMonthIndex = index - (date.getDate() - 1);
                const hasFirstOfMonth = firstOfMonthIndex >= 0 && timeScale[firstOfMonthIndex] && timeScale[firstOfMonthIndex].getDate() === 1 && timeScale[firstOfMonthIndex].getMonth() === date.getMonth();

                if (isNotFirstOfMonth && hasFirstOfMonth) {
                  return null; // Skip rendering non-first days when first of month exists
                }

                return (
                  <div
                    key={index}
                    className={`w-4 border-r border-gray-100 h-4 relative ${
                      isToday ? 'bg-green-500' :
                      isWeekendDay ? 'bg-gray-400 bg-opacity-30' : 'bg-gray-50'
                    }`}
                    style={isFirstOfMonth ? { flex: daysInMonth } : { flex: 1 }}
                  >
                    {isFirstOfMonth && (
                      <div className={`text-xs font-medium text-center leading-none absolute inset-0 flex items-center justify-center border border-gray-300 bg-white ${
                          isToday ? 'text-white bg-green-500 border-green-600 font-bold' : 'text-gray-700'
                        }`}>
                        {viewMode === 'year'
                          ? monthName
                          : `${monthName} ${date.getFullYear()}`
                        }
                      </div>
                    )}
                  </div>
                );
              }).filter(Boolean)}
            </div>

            {/* Dates Row */}
            <div className="flex">
              {timeScale.map((date, index) => {
                const isWeekendDay = isWeekend(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isNewYear = date.getMonth() === 0 && date.getDate() === 1;

                return (
                  <div
                    key={index}
                   className={`flex-1 border-r border-gray-100 h-3 relative ${
                      isToday ? 'bg-green-500' :
                      isWeekendDay ? 'bg-gray-400 bg-opacity-30' : 'bg-gray-50'
                    }`}
                    title={date.toLocaleDateString('fr-FR')}
                  >
                   <div className={`text-xs font-medium flex items-center justify-center h-full leading-none ${
                        isToday ? 'text-white font-bold' :
                        'text-gray-700'
                      }`}>
                      {date.getDate()}
                    </div>
                    {/* Weekend grid line */}
                    {isWeekendDay && (
                      <div className="absolute inset-0 bg-gray-400 bg-opacity-20 pointer-events-none" />
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
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`flex-1 border-r border-gray-100 relative h-12 min-w-0 ${
                      isToday ? 'bg-green-100' :
                      isWeekendDay ? 'bg-gray-400 bg-opacity-20' : 'bg-blue-50'
                    }`}
                  >
                    {/* Weekend grid line */}
                    {isWeekendDay && (
                      <div className="absolute inset-0 bg-gray-400 bg-opacity-30 pointer-events-none" />
                    )}
                  </div>
                );
              })}

              {/* Key Date Markers */}
              {[
                { key: 'start_in_be', date: project.key_dates.start_in_be, color: '#3B82F6', label: 'Start In BE' },
                { key: 'wood_foam_launch', date: project.key_dates.wood_foam_launch, color: '#F59E0B', label: 'Lancement Bois/Mousse' },
                { key: 'previewed_delivery', date: project.key_dates.previewed_delivery, color: '#10B981', label: 'Livraison Prévue' },
                { key: 'last_call', date: project.key_dates.last_call, color: '#EF4444', label: 'Dernier Appel' }
              ].map(({ key, date, color: markerColor, label }) => {
                const keyDate = new Date(date);
                const dayWidth = 100 / timeScale.length;

                // Find the exact day index for this key date
                const keyDateDayIndex = timeScale.findIndex(timelineDate =>
                  timelineDate.toDateString() === keyDate.toDateString()
                );

                // Position marker in the middle of the day column
                const keyDatePercentage = keyDateDayIndex >= 0
                  ? (keyDateDayIndex * dayWidth) + (dayWidth * 0.5)
                  : -1;

                // Only show marker if date is found in timeline
                if (keyDatePercentage >= 0) {
                  return (
                    <div
                      key={key}
                      className="absolute w-0.5 z-20 pointer-events-none"
                      style={{
                        left: `${keyDatePercentage}%`,
                        top: '8px',
                        bottom: '8px',
                        backgroundColor: markerColor,
                        boxShadow: `0 0 4px ${markerColor}`
                      }}
                      title={`${label}: ${keyDate.toLocaleDateString('fr-FR')}`}
                    >
                      {/* Diamond marker at top */}
                      <div
                        className="absolute -top-1 -left-0.5 w-1 h-1 transform rotate-45"
                        style={{ backgroundColor: markerColor }}
                      />
                      {/* Diamond marker at bottom */}
                      <div
                        className="absolute -bottom-1 -left-0.5 w-1 h-1 transform rotate-45"
                        style={{ backgroundColor: markerColor }}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Task Rows */}
          {tasks.map((task, index) => {
            const { startPercentage, widthPercentage } = getTaskPosition(task);
            const phaseColor = getPhaseColor(task.phase);
            const statusColor = getStatusColor(task.status);
            const assignee = BE_TEAM_MEMBERS.find(m => m.id === task.assignee_id);

            return (
              <div
                key={task.id}
                draggable={onReorderTasks !== undefined}
                onDragStart={() => handleRowDragStart(index)}
                onDragOver={(e) => handleRowDragOver(e, index)}
                onDragEnd={handleRowDragEnd}
                className={`flex border-b border-gray-100 hover:bg-gray-50 group ${
                  draggedRowIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="w-80 p-4 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    {onReorderTasks && (
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phaseColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                        onDoubleClick={() => handleTaskDoubleClick(task)}
                        title="Double-click to edit"
                      >
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
                      <div className="flex items-center space-x-2 mt-1">
                        {assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{assignee.name}</span>
                          </div>
                        )}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div className="flex items-center space-x-1 bg-blue-50 px-2 py-0.5 rounded">
                            <Link className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600">{task.dependencies.length}</span>
                          </div>
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
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className={`flex-1 border-r border-gray-100 relative h-20 min-w-0 ${
                          isToday ? 'bg-green-100' :
                          isWeekendDay ? 'bg-gray-400 bg-opacity-20' : 'bg-white'
                        }`}
                      >
                        {/* Weekend grid line */}
                        {isWeekendDay && (
                          <div className="absolute inset-0 bg-gray-400 bg-opacity-30 pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Task Bar */}
                  {task.start_date && task.end_date && (
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded flex items-center cursor-pointer z-10 shadow-sm border border-white whitespace-nowrap ${
                        draggedTask === task.id ? 'opacity-60' : 'opacity-80'
                      }`}
                      style={{
                        left: `${startPercentage}%`,
                        width: `${widthPercentage}%`,
                        backgroundColor: statusColor
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
                        <div className="text-xs text-white px-2 truncate">
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

          {/* Dependency Lines */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {tasks.map((task, taskIndex) => {
              if (!task.dependencies || task.dependencies.length === 0) return null;

              return task.dependencies.map((depId) => {
                const depTask = tasks.find(t => t.id === depId);
                if (!depTask || !depTask.end_date || !task.start_date) return null;

                const depIndex = tasks.findIndex(t => t.id === depId);
                if (depIndex === -1) return null;

                const depEndOffset = getTaskPosition(depTask).startOffset + getTaskPosition(depTask).duration;
                const taskStartOffset = getTaskPosition(task).startOffset;

                // Calculate Y positions (center of each task row)
                const depY = (depIndex * 80) + 40 + 120; // 80px per row + header offset
                const taskY = (taskIndex * 80) + 40 + 120;

                // Calculate X positions
                const depX = 320 + (depEndOffset * 16); // 320px left panel width
                const taskX = 320 + (taskStartOffset * 16);

                // Create a path from dependency end to task start
                const midX = (depX + taskX) / 2;

                return (
                  <g key={`${task.id}-${depId}`}>
                    <defs>
                      <marker
                        id={`arrowhead-${task.id}-${depId}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
                      </marker>
                    </defs>
                    <path
                      d={`M ${depX} ${depY} L ${midX} ${depY} L ${midX} ${taskY} L ${taskX} ${taskY}`}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                      markerEnd={`url(#arrowhead-${task.id}-${depId})`}
                      opacity="0.6"
                    />
                  </g>
                );
              });
            })}
          </svg>

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

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          allTasks={tasks}
          onSave={handleSaveTaskEdit}
          onCancel={() => setEditingTask(null)}
          projectBeTeamIds={project.be_team_member_ids}
        />
      )}
    </div>
  );
};
