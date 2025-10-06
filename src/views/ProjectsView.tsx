import React, { useState } from 'react';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { ProjectGanttChart } from '../components/Gantt/ProjectGanttChart';
import { TaskManager } from '../components/Tasks/TaskManager';
import { useProjects } from '../hooks/useProjects';
import { useLanguage } from '../hooks/useLanguage';
import { Plus, Search, Grid2x2 as Grid, List } from 'lucide-react';
import type { Project } from '../types';

export const ProjectsView: React.FC = () => {
  const { projects, sortProjectsByNextDate, createProject, updateProject, getTasksForProject, tasks, updateProjectTasks } = useProjects();
  const { t } = useLanguage();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectGantt, setShowProjectGantt] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = sortProjectsByNextDate(projects).filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.bc_order_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedProject) {
      // Update existing project
      await updateProject(selectedProject.id, projectData);
    } else {
      // Create new project
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

  const handleUpdateTask = async (taskId: string, updates: Partial<any>) => {
    const projectTasks = tasks.filter(task => task.project_id === selectedProject?.id);
    const updatedTasks = projectTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    if (selectedProject) {
      await updateProjectTasks(selectedProject.id, updatedTasks);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedProject) return;
    const projectTasks = tasks.filter(task => task.project_id === selectedProject.id);
    const updatedTasks = projectTasks.filter(task => task.id !== taskId);
    await updateProjectTasks(selectedProject.id, updatedTasks);
  };

  if (showProjectGantt && selectedProject) {
    return (
      <div className="flex-1 p-6">
        <ProjectGanttChart
          project={selectedProject}
          tasks={getTasksForProject(selectedProject.id)}
          onBack={handleBackFromProjectGantt}
          onManageTasks={handleManageTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
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
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('projects.subtitle')} • {filteredProjects.length} {t('projects.title').toLowerCase()}
          </p>
        </div>
        
        <button
          onClick={() => setShowProjectForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{t('projects.new_project')}</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('projects.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        <div className="flex border border-gray-300 rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-l-md`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-r-md`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('project.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('project.client')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('project.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('overview.progress')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('overview.next')} Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const progressPercentage = Math.round((project.hours_completed / project.hours_previewed) * 100);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleProjectClick(project)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.bc_order_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                          project.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`status.${project.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(Math.round((getTasksForProject ? getTasksForProject(project.id).reduce((sum, task) => sum + (task.progress || 0), 0) / Math.max(getTasksForProject(project.id).length, 1) : progressPercentage)), 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((getTasksForProject ? getTasksForProject(project.id).reduce((sum, task) => sum + (task.progress || 0), 0) / Math.max(getTasksForProject(project.id).length, 1) : progressPercentage))}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(project.key_dates.start_in_be).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm ? t('projects.no_search_results') : t('projects.no_projects')}
          </div>
        </div>
      )}

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
