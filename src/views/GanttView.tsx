import React, { useState } from 'react';
import { GanttChart } from '../components/Gantt/GanttChart';
import { ProjectGanttChart } from '../components/Gantt/ProjectGanttChart';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { TaskManager } from '../components/Tasks/TaskManager';
import { useProjects } from '../hooks/useProjects';
import { useLanguage } from '../hooks/useLanguage';
import { Filter, Plus, Download } from 'lucide-react';
import type { Project } from '../types';

export const GanttView: React.FC = () => {
  const { projects, tasks, sortProjectsByNextDate, createProject, updateProject, getTasksForProject, updateProjectTasks } = useProjects();
  const { t } = useLanguage();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectGantt, setShowProjectGantt] = useState(false);
  const [viewMode, setViewMode] = useState<'year' | 'quarter' | 'month' | 'week'>('week');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');

  const sortedProjects = sortProjectsByNextDate(projects).filter(project => 
    (statusFilter === 'all' || project.status === statusFilter) &&
    (subCategoryFilter === 'all' || project.sub_category === subCategoryFilter)
  );

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedProject) {
      // This is an update to an existing project
      console.log('🔄 UPDATING existing project:', selectedProject.id, selectedProject.name);
      await updateProject(selectedProject.id, projectData);
    } else {
      // This is a new project
      console.log('➕ CREATING new project:', projectData.name);
      await createProject(projectData);
    }
    setShowProjectForm(false);
    setSelectedProject(null);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setSelectedProject(null);
  };

  const handleViewProjectGantt = (project: Project) => {
    setSelectedProject(project);
    setShowProjectGantt(true);
    setShowProjectForm(false);
  };

  const handleBackFromProjectGantt = () => {
    setShowProjectGantt(false);
    setSelectedProject(null);
  };

  const handleManageTasks = () => {
    setShowTaskManager(true);
  };

  const handleSaveTasks = async (updatedTasks: any[]) => {
    if (selectedProject) {
      await updateProjectTasks(selectedProject.id, updatedTasks);
      setShowTaskManager(false);
    }
  };

  const handleCloseTaskManager = () => {
    setShowTaskManager(false);
  };

  if (showProjectGantt && selectedProject) {
    return (
      <div className="flex-1 p-6 overflow-hidden">
        <ProjectGanttChart
          project={selectedProject}
          tasks={getTasksForProject(selectedProject.id)}
          onBack={handleBackFromProjectGantt}
          onManageTasks={handleManageTasks}
        />
        {showTaskManager && (
          <TaskManager
            projectId={selectedProject.id}
            tasks={tasks.filter(task => task.project_id === selectedProject.id)}
            onSave={handleSaveTasks}
            onCancel={handleCloseTaskManager}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-hidden h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('gantt.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('gantt.subtitle')} • {sortedProjects.length} projects
          </p>
        </div>
      </div>

      <GanttChart
        projects={sortedProjects}
        tasks={tasks}
        viewMode={viewMode}
        onProjectClick={handleProjectClick}
        onNewProject={() => setShowProjectForm(true)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        subCategoryFilter={subCategoryFilter}
        onSubCategoryFilterChange={setSubCategoryFilter}
        onViewModeChange={setViewMode}
        onExport={() => {}}
      />

      {showProjectForm && (
        <ProjectForm
          project={selectedProject}
          onSave={handleSaveProject}
          onCancel={handleCloseForm}
          onViewGantt={handleViewProjectGantt}
        />
      )}
    </div>
  );
};