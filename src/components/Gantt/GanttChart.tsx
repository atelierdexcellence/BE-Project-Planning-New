import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Filter, Download, Calendar, Settings } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { PROJECT_SUB_CATEGORIES } from '../../types';
import type { Project, Task } from '../../types';

interface ProjectHoverProps {
  project: Project;
  position: { x: number; y: number };
  onClose: () => void;
}

const ProjectHover: React.FC<ProjectHoverProps> = ({ project, position, onClose }) => {
  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 10}px`,
        transform: 'translateY(-100%)'
      }}
      onMouseLeave={onClose}
    >
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
      <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
      <p className="text-sm text-gray-600 mb-2">{project.client}</p>
      <div className="text-xs text-gray-500">
        <p>BC: {project.bc_order_number}</p>
        <p>Progress: {Math.round((project.hours_completed / project.hours_previewed) * 100)}%</p>
      </div>
    </div>
  );
};

interface GanttChartProps {
  projects: Project[];
  tasks: Task[];
  viewMode: 'year' | 'quarter' | 'month' | 'week';
  onProjectClick?: (project: Project) => void;
  onNewProject?: () => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  subCategoryFilter: string;
  onSubCategoryFilterChange: (filter: string) => void;
  onViewModeChange: (mode: 'year' | 'quarter' | 'month' | 'week') => void;
  onExport?: () => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ 
  projects, 
  tasks, 
  viewMode = 'week',
  onProjectClick,
  onNewProject,
  statusFilter,
  onStatusFilterChange,
  subCategoryFilter,
  onSubCategoryFilterChange,
  onViewModeChange,
  onExport
}) => {
  const { t, language } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [hoveredProject, setHoveredProject] = useState<{ project: Project; position: { x: number; y: number } } | null>(null);
  
  // Date and navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekScrollOffset, setWeekScrollOffset] = useState(0);
  const [monthScrollOffset, setMonthScrollOffset] = useState(0);
  const [quarterScrollOffset, setQuarterScrollOffset] = useState(0);
  const [yearScrollOffset, setYearScrollOffset] = useState(0);
  
  // Drag scrolling state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Mouse wheel handler for vertical scrolling
  const handleTimelineWheel = useCallback((e: React.WheelEvent) => {
    if (!timelineRef.current) return;
    
    // If shift is held or horizontal scroll, use existing navigation logic
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      
      // Determine scroll direction
      const scrollDirection = e.deltaX > 0 || (e.shiftKey && e.deltaY > 0) ? 1 : -1;
      
      // Navigate time periods
      if (scrollDirection > 0) {
        navigateNext();
      } else {
        navigatePrevious();
      }
      return;
    }
    // Allow normal vertical scrolling for other cases
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: timelineRef.current.scrollLeft,
      scrollTop: timelineRef.current.scrollTop
    });
    
    e.preventDefault();
  }, []);

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineRef.current) return;
      
      e.preventDefault();
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // For all views, use navigation instead of scroll
      if (viewMode === 'year' || viewMode === 'quarter' || viewMode === 'month' || viewMode === 'week') {
        // Calculate drag sensitivity - larger movements trigger navigation
        const dragThreshold = 50;
        
        if (Math.abs(deltaX) > dragThreshold) {
          if (deltaX > 0) {
            // Dragging right = go to previous period (backward in time)
            if (viewMode === 'year') {
              setYearScrollOffset(prev => prev - 1);
            } else if (viewMode === 'quarter') {
              setQuarterScrollOffset(prev => prev - 1);
            } else if (viewMode === 'month') {
              setMonthScrollOffset(prev => prev - 1);
            } else if (viewMode === 'week') {
              setWeekScrollOffset(prev => prev - 1);
            }
          } else {
            // Dragging left = go to next period (forward in time)
            if (viewMode === 'year') {
              setYearScrollOffset(prev => prev + 1);
            } else if (viewMode === 'quarter') {
              setQuarterScrollOffset(prev => prev + 1);
            } else if (viewMode === 'month') {
              setMonthScrollOffset(prev => prev + 1);
            } else if (viewMode === 'week') {
              setWeekScrollOffset(prev => prev + 1);
            }
          }
          // Reset drag start to prevent multiple triggers
          setDragStart(prev => ({ ...prev, x: e.clientX }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, viewMode]);

  // Update timeline container overflow based on view mode
  const timelineOverflowX = useMemo(() => {
    // All views now use navigation, so hide horizontal scrollbar
    return 'hidden';
  }, []);

  // Filter projects based on status
  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      (statusFilter === 'all' || project.status === statusFilter) &&
      (subCategoryFilter === 'all' || project.sub_category === subCategoryFilter)
    );
  }, [projects, statusFilter, subCategoryFilter]);

  // Sort projects by priority and name
  const sortedProjects = useMemo(() => {
    const sorted = filteredProjects.slice().sort((a, b) => {
      // First sort by sub_category priority
      const categoryA = PROJECT_SUB_CATEGORIES.find(cat => cat.id === a.sub_category);
      const categoryB = PROJECT_SUB_CATEGORIES.find(cat => cat.id === b.sub_category);
      
      if (categoryA && categoryB && categoryA.priority !== categoryB.priority) {
        return categoryA.priority - categoryB.priority;
      }
      
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
    
    return sorted;
  }, [filteredProjects]);

  const { timeScale, startDate, endDate } = useMemo(() => {
    const now = new Date(currentDate);
    
    let startDate: Date;
    let endDate: Date;
    
    switch (viewMode) {
      case 'week':
        // Show only one week at a time, but allow navigation through weekScrollOffset
        const currentDay = now.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Handle Sunday as 0
        startDate = new Date(now);
        startDate.setDate(now.getDate() + mondayOffset + (7 * weekScrollOffset)); // Current week + offset
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Show only 7 days (one week)
        break;
      case 'month':
        // Show only one month at a time, but allow navigation through monthScrollOffset
        startDate = new Date(now.getFullYear(), now.getMonth() + monthScrollOffset, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + monthScrollOffset + 1, 0);
        break;
      case 'quarter':
        // Show only one quarter at a time, but allow navigation through quarterScrollOffset
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const targetQuarter = currentQuarter + quarterScrollOffset;
        const targetYear = now.getFullYear() + Math.floor(targetQuarter / 4);
        const adjustedQuarter = ((targetQuarter % 4) + 4) % 4;
        startDate = new Date(targetYear, adjustedQuarter * 3, 1);
        endDate = new Date(targetYear, (adjustedQuarter * 3) + 3, 0);
        break;
      case 'year':
        // Show only one year at a time, but allow navigation through yearScrollOffset
        startDate = new Date(now.getFullYear() + yearScrollOffset, 0, 1);
        endDate = new Date(now.getFullYear() + yearScrollOffset, 11, 31);
        break;
      default:
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 2);
    }
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const timeScale = [];
    
    for (let i = 0; i <= totalDays - 1; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      timeScale.push(date);
    }
    
    return { timeScale, startDate, endDate, totalDays };
  }, [viewMode, currentDate, weekScrollOffset, monthScrollOffset, quarterScrollOffset, yearScrollOffset]);

  // Navigation functions
  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setWeekScrollOffset(prev => prev - 1); // Go to previous week
    } else if (viewMode === 'month') {
      setMonthScrollOffset(prev => prev - 1); // Go to previous month
    } else if (viewMode === 'quarter') {
      setQuarterScrollOffset(prev => prev - 1); // Go to previous quarter
    } else if (viewMode === 'year') {
      setYearScrollOffset(prev => prev - 1); // Go to previous year
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setWeekScrollOffset(prev => prev + 1); // Go to next week
    } else if (viewMode === 'month') {
      setMonthScrollOffset(prev => prev + 1); // Go to next month
    } else if (viewMode === 'quarter') {
      setQuarterScrollOffset(prev => prev + 1); // Go to next quarter
    } else if (viewMode === 'year') {
      setYearScrollOffset(prev => prev + 1); // Go to next year
    }
  };

  const navigateToday = () => {
    if (viewMode === 'week') {
      setWeekScrollOffset(0);
    } else if (viewMode === 'month') {
      setMonthScrollOffset(0);
    } else if (viewMode === 'quarter') {
      setQuarterScrollOffset(0);
    } else if (viewMode === 'year') {
      setYearScrollOffset(0);
    }
    setCurrentDate(new Date());
  };

  // Reset scroll offset when view mode changes
  useEffect(() => {
    setWeekScrollOffset(0);
    setMonthScrollOffset(0);
    setQuarterScrollOffset(0);
    setYearScrollOffset(0);
    setCurrentDate(new Date());
  }, [viewMode]);

  const getProjectPosition = (project: Project) => {
    const projectStart = new Date(project.key_dates.start_in_be);
    const projectEnd = new Date(project.key_dates.last_call);
    
    const startOffset = Math.max(0, Math.ceil((projectStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return { startOffset, duration };
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      planning: '#6B7280',
      in_progress: '#3B82F6',
      at_risk: '#F59E0B',
      overdue: '#EF4444',
      completed: '#10B981',
      on_hold: '#8B5CF6'
    };
    return colors[status];
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleProjectHover = (project: Project, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredProject({
      project,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    });
  };

  const handleProjectLeave = () => {
    setHoveredProject(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Format current period display
  const getCurrentPeriodLabel = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        const weekStart = new Date(date);
        const currentDay = date.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        weekStart.setDate(date.getDate() + mondayOffset + (7 * weekScrollOffset));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      case 'month':
        const monthDate = new Date(date.getFullYear(), date.getMonth() + monthScrollOffset, 1);
        return monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'quarter':
        const currentQuarter = Math.floor(date.getMonth() / 3);
        const targetQuarter = currentQuarter + quarterScrollOffset;
        const targetYear = date.getFullYear() + Math.floor(targetQuarter / 4);
        const adjustedQuarter = ((targetQuarter % 4) + 4) % 4;
        return `Q${adjustedQuarter + 1} ${targetYear}`;
      case 'year':
        return (date.getFullYear() + yearScrollOffset).toString();
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 h-full overflow-hidden relative">
      {/* Fixed Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('gantt.all_status')}</option>
              <option value="planning">{t('status.planning')}</option>
              <option value="in_progress">{t('status.in_progress')}</option>
              <option value="at_risk">{t('status.at_risk')}</option>
              <option value="overdue">{t('status.overdue')}</option>
              <option value="completed">{t('status.completed')}</option>
              <option value="on_hold">{t('status.on_hold')}</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2 mr-4">
              <button
                onClick={navigatePrevious}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Previous period"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center min-w-[200px]">
                <div className="text-sm font-medium text-gray-900">
                  {getCurrentPeriodLabel()}
                </div>
                <button
                  onClick={navigateToday}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {t('gantt.today')}
                </button>
              </div>
              
              <button
                onClick={navigateNext}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Next period"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={subCategoryFilter}
              onChange={(e) => onSubCategoryFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('gantt.all_categories')}</option>
              {PROJECT_SUB_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.priority}. {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex border border-gray-300 rounded-md">
            {(['week', 'month', 'quarter', 'year'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-2 text-sm capitalize ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${mode === 'week' ? 'rounded-l-md' : mode === 'year' ? 'rounded-r-md' : ''}`}
              >
                {t(`gantt.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{t('gantt.export')}</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('projects.new_project')}</span>
          </button>
        </div>
      </div>

      {/* Main Gantt Chart */}
      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex max-h-[calc(100vh-300px)]">
        {/* Fixed Project Column */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
          {/* Fixed Header */}
          <div className="p-4 border-b border-gray-200 font-medium text-gray-900 bg-gray-50 sticky top-0 z-10">
            {t('gantt.project_column_title')}
          </div>
          
          {/* Fixed Project Names */}
          <div className="flex-1 overflow-y-auto">
            {sortedProjects.map((project) => {
              const color = getStatusColor(project.status);
              const isExpanded = expandedProjects.has(project.id);
              
              return (
                <div key={project.id} className="border-b border-gray-50 hover:bg-gray-50 relative min-h-[30px] flex items-center">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleProjectExpanded(project.id)}
                     className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                     <svg 
                       className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                    </button>
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                            onClick={() => onProjectClick?.(project)}>
                          {project.name}
                        </h5>
                        <span className={`px-2 py-1 rounded-full capitalize flex-shrink-0 ml-2 text-xs ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                          project.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`status.${project.status}`)}
                        </span>
                      </div>
                      {isExpanded && (
                        <>
                          <p className="text-xs text-gray-500 truncate">
                            {project.client}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {PROJECT_SUB_CATEGORIES.find(cat => cat.id === project.sub_category)?.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {project.bc_order_number}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div 
          className="flex-1 overflow-x-auto overflow-y-auto scrollbar-always-visible"
          ref={timelineRef} 
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            overflowX: timelineOverflowX,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleTimelineWheel}
          onDragStart={(e) => e.preventDefault()}
          onSelectStart={(e) => e.preventDefault()}
        >
          <div className="min-w-full min-h-full">
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

            {/* Project Rows */}
            <div className="flex-1 min-w-full">
              {sortedProjects.map((project) => {
                const color = getStatusColor(project.status);
                const isExpanded = expandedProjects.has(project.id);
                const weekNumber = getWeekNumber(new Date());
                
                // Calculate project position as percentage of total timeline
                const projectStart = new Date(project.key_dates.start_in_be);
                const projectEnd = new Date(project.key_dates.last_call);
                const timelineStart = startDate.getTime();
                const timelineEnd = endDate.getTime();
                const timelineWidth = timelineEnd - timelineStart;
                
                // Calculate exact positioning based on days
                const totalDays = timeScale.length;
                const dayWidth = 100 / totalDays; // Each day takes this percentage of width
                
                // Find the day index for start and end dates
                const startDayIndex = timeScale.findIndex(date => 
                  date.toDateString() === projectStart.toDateString()
                );
                const endDayIndex = timeScale.findIndex(date => 
                  date.toDateString() === projectEnd.toDateString()
                );
                
                // Position start at left edge of start day, end at middle of end day
                const startPercentage = startDayIndex >= 0 ? startDayIndex * dayWidth : 0;
                const endPercentage = endDayIndex >= 0 ? (endDayIndex * dayWidth) + (dayWidth * 0.5) : 100;
                const widthPercentage = Math.max(dayWidth * 0.5, endPercentage - startPercentage);
                
                return (
                  <div key={project.id} className="border-b border-gray-50 hover:bg-gray-50 relative min-h-[60px] flex items-center">
                    <div className="flex w-full">
                      {timeScale.map((date, index) => {
                        const isWeekendDay = isWeekend(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <div
                            key={index}
                            className={`flex-1 border-r border-gray-100 relative h-[30px] min-w-0 ${
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
                    </div>
                    
                    {/* Project Timeline Bar */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded flex items-center cursor-pointer z-10 shadow-sm border border-white whitespace-nowrap"
                      title={`Week ${weekNumber} - ${new Date().toDateString()}`}
                      onClick={() => onProjectClick?.(project)}
                      onMouseEnter={(e) => handleProjectHover(project, e)}
                      onMouseLeave={handleProjectLeave}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        left: `${startPercentage}%`,
                        width: `${widthPercentage}%`,
                        backgroundColor: color,
                        opacity: 0.8
                      }}
                    >
                      <div className="text-white px-2 truncate font-medium flex-1 text-xs">
                        {project.name}
                      </div>
                      <div className="text-white px-2 opacity-75 text-xs">
                        {Math.round((project.hours_completed / project.hours_previewed) * 100)}%
                      </div>
                    </div>
                    
                    {/* Key Date Markers */}
                    {[
                      { key: 'wood_foam_launch', date: project.key_dates.wood_foam_launch, color: '#F59E0B', label: 'Lancement Bois/Mousse' },
                      { key: 'previewed_delivery', date: project.key_dates.previewed_delivery, color: '#10B981', label: 'Livraison Prévue' },
                      { key: 'last_call', date: project.key_dates.last_call, color: '#EF4444', label: 'Dernier Appel' }
                    ].map(({ key, date, color: markerColor, label }) => {
                      const keyDate = new Date(date);
                      
                      // Find the exact day index for this key date
                      const keyDateDayIndex = timeScale.findIndex(timelineDate => 
                        timelineDate.toDateString() === keyDate.toDateString()
                      );
                      
                      // Position marker in the middle of the day column
                      const keyDatePercentage = keyDateDayIndex >= 0 
                        ? (keyDateDayIndex * dayWidth) + (dayWidth * 0.5)  // Middle of the day
                        : -1; // Not found in timeline
                      
                      // Only show marker if date is found in timeline
                      if (keyDatePercentage >= 0) {
                        return (
                          <div
                            key={key}
                            className="absolute w-0.5 z-20 pointer-events-none"
                            style={{
                              left: `${keyDatePercentage}%`,
                              top: '11px',
                              bottom: '11px',
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Project Hover Popup */}
      {hoveredProject && (
        <ProjectHover
          project={hoveredProject.project}
          position={hoveredProject.position}
          onClose={handleProjectLeave}
        />
      )}
      
      {/* Legend for Key Dates - Shows in all view modes */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <span className="text-gray-700">{t('gantt.wood_foam_launch')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span className="text-gray-700">{t('gantt.previewed_delivery')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-gray-700">{t('gantt.last_call')}</span>
        </div>
      </div>
    </div>
  );
};