import { useState, useCallback } from 'react';
import type { Project, Task, TimeEntry } from '../types';

// Mock data - replace with real API calls
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Project Alpha',
    status: 'in_progress',
    sub_category: 'dev_in_progress',
    color: '#3B82F6',
    bc_order_number: 'BC001',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    client: 'Client A',
    collection_models: 'Collection Spring 2024',
    composition: 'Cotton blend',
    date_of_brief: '2024-01-15',
    commercial_id: 'virginie',
    atelier: 'siegeair',
    be_team_member_ids: ['as', 'mr'],
    key_dates: {
      start_in_be: '2024-02-01',
      wood_foam_launch: '2024-03-15',
      previewed_delivery: '2024-04-30',
      last_call: '2024-05-15'
    },
    hours_previewed: 120,
    hours_completed: 80,
    notes: [],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    name: 'Project Beta',
    status: 'at_risk',
    sub_category: 'prod_with_be_tracking',
    color: '#F59E0B',
    bc_order_number: 'BC002',
    image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    client: 'Client B',
    collection_models: 'Collection Summer 2024',
    composition: 'Linen mix',
    date_of_brief: '2024-01-20',
    commercial_id: 'nicholas',
    atelier: 'maison_fey_vannes',
    be_team_member_ids: ['mr'],
    key_dates: {
      start_in_be: '2024-02-15',
      wood_foam_launch: '2024-03-30',
      previewed_delivery: '2024-05-15',
      last_call: '2024-06-01'
    },
    hours_previewed: 150,
    hours_completed: 45,
    notes: [],
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  },
  {
    id: '3',
    name: 'Project Gamma',
    status: 'overdue',
    sub_category: 'updates_nomenclature',
    color: '#EF4444',
    bc_order_number: 'BC003',
    image_url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    client: 'Client C',
    collection_models: 'Collection Fall 2024',
    composition: 'Wool blend',
    date_of_brief: '2023-12-15',
    commercial_id: 'aurelie',
    atelier: 'maison_fey_paris',
    be_team_member_ids: ['aq', 'sr'],
    key_dates: {
      start_in_be: '2024-01-01',
      wood_foam_launch: '2024-02-15',
      previewed_delivery: '2024-03-30',
      last_call: '2024-04-15'
    },
    hours_previewed: 200,
    hours_completed: 180,
    notes: [],
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    project_id: '1',
    name: 'Réunion de lancement',
    category: 'reunion_lancement',
    phase: 'pre_prod',
    start_date: '2024-02-01',
    end_date: '2024-02-28',
    assignee_id: 'as',
    status: 'completed',
    progress: 100,
    dependencies: [],
    order: 0,
    enabled: true
  },
  {
    id: '2',
    project_id: '1',
    name: 'BE plans pour validation client',
    category: 'be_plans_validation',
    phase: 'pre_prod',
    start_date: '2024-02-15',
    end_date: '2024-03-01',
    assignee_id: 'as',
    status: 'in_progress',
    progress: 80,
    dependencies: ['1'],
    order: 1,
    enabled: true
  },
  {
    id: '3',
    project_id: '1',
    name: 'Commande mousse',
    category: 'commande_mousse',
    phase: 'prod',
    start_date: '2024-03-01',
    end_date: '2024-03-31',
    assignee_id: 'as',
    status: 'in_progress',
    progress: 65,
    dependencies: ['2'],
    order: 2,
    enabled: true
  },
  {
    id: '4',
    project_id: '2',
    name: 'Réunion de lancement',
    category: 'reunion_lancement',
    phase: 'pre_prod',
    start_date: '2024-02-15',
    end_date: '2024-03-01',
    assignee_id: 'mr',
    status: 'completed',
    progress: 100,
    dependencies: [],
    order: 0,
    enabled: true
  },
  {
    id: '5',
    project_id: '2',
    name: 'BE conception 3D',
    category: 'be_conception_3d',
    phase: 'pre_prod',
    start_date: '2024-03-01',
    end_date: '2024-03-20',
    assignee_id: 'mr',
    status: 'in_progress',
    progress: 40,
    dependencies: ['4'],
    order: 1,
    enabled: true
  },
  {
    id: '6',
    project_id: '3',
    name: 'Réunion de lancement',
    category: 'reunion_lancement',
    phase: 'pre_prod',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    assignee_id: 'aq',
    status: 'completed',
    progress: 100,
    dependencies: [],
    order: 0,
    enabled: true
  },
  {
    id: '7',
    project_id: '3',
    name: 'Tapisserie',
    category: 'tapisserie',
    phase: 'prod',
    start_date: '2024-01-15',
    end_date: '2024-02-28',
    assignee_id: 'aq',
    status: 'blocked',
    progress: 20,
    dependencies: ['6'],
    order: 1,
    enabled: true
  }
];

const MOCK_TIME_ENTRIES: TimeEntry[] = [
  {
    id: '1',
    project_id: '1',
    user_id: 'as',
    user_name: 'ALEXANDER SMITH (AS)',
    hours: 8.5,
    date: '2024-01-20',
    description: 'Initial design work',
    task_category: 'be_conception_3d',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    user_id: 'mr',
    user_name: 'MAËLYS DE LA RUÉE (MR)',
    hours: 4.25,
    date: '2024-01-21',
    description: 'Technical review',
    task_category: 'be_plans_validation',
    created_at: '2024-01-21T14:00:00Z',
    updated_at: '2024-01-21T14:00:00Z'
  },
  {
    id: '3',
    project_id: '2',
    user_id: 'mr',
    user_name: 'MAËLYS DE LA RUÉE (MR)',
    hours: 6.75,
    date: '2024-01-22',
    description: 'Project setup and planning',
    created_at: '2024-01-22T09:00:00Z',
    updated_at: '2024-01-22T09:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(MOCK_TIME_ENTRIES);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  }, []);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      // First, remove any existing project with this ID to prevent duplicates
      const filteredProjects = prev.filter(p => p.id !== id);
      
      // Find the original project to update
      const originalProject = prev.find(p => p.id === id);
      if (!originalProject) {
        console.warn(`Project with id ${id} not found for update`);
        return prev;
      }
      
      // Create the updated project
      const updatedProject = { 
        ...originalProject, 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      
      // Add the updated project back
      return [...filteredProjects, updatedProject];
    });
  }, []);

  const addProjectUpdate = useCallback(async (projectId: string, content: string, authorId: string, authorName: string) => {
    const newUpdate: ProjectNote = {
      id: Date.now().toString(),
      project_id: projectId,
      content,
      author_id: authorId,
      author_name: authorName,
      created_at: new Date().toISOString(),
      type: 'update'
    };

    // Add update to project
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, notes: [...p.notes, newUpdate], updated_at: new Date().toISOString() }
        : p
    ));

    // Send notifications (mock implementation - replace with real email service)
    const project = projects.find(p => p.id === projectId);
    if (project) {
      console.log(`📧 Email notification sent to Commercial (${project.commercial_id}): New update on ${project.name}`);
      console.log(`📧 Email notification sent to BE Team (${project.be_team_member_id}): New update on ${project.name}`);
      
      // In a real implementation, you would call your email service here:
      // await emailService.sendNotification({
      //   to: [project.commercial_id, project.be_team_member_id],
      //   subject: `Project Update: ${project.name}`,
      //   body: `New update added by ${authorName}: ${content}`
      // });
    }

    return newUpdate;
  }, [projects]);

  const deleteProject = useCallback(async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const getTasksForProject = useCallback((projectId: string) => {
    return tasks
      .filter(task => task.project_id === projectId && task.enabled)
      .sort((a, b) => a.order - b.order);
  }, [tasks]);

  const updateProjectTasks = useCallback(async (projectId: string, updatedTasks: Task[]) => {
    setTasks(prev => [
      ...prev.filter(task => task.project_id !== projectId),
      ...updatedTasks
    ]);
  }, []);

  const sortProjectsByNextDate = useCallback((projects: Project[]) => {
    return [...projects].sort((a, b) => {
      const nextDateA = new Date(Math.min(
        new Date(a.key_dates.start_in_be).getTime(),
        new Date(a.key_dates.wood_foam_launch).getTime(),
        new Date(a.key_dates.previewed_delivery).getTime(),
        new Date(a.key_dates.last_call).getTime()
      ));
      const nextDateB = new Date(Math.min(
        new Date(b.key_dates.start_in_be).getTime(),
        new Date(b.key_dates.wood_foam_launch).getTime(),
        new Date(b.key_dates.previewed_delivery).getTime(),
        new Date(b.key_dates.last_call).getTime()
      ));
      return nextDateA.getTime() - nextDateB.getTime();
    });
  }, []);

  const getTimeEntriesForProject = useCallback((projectId: string) => {
    return timeEntries.filter(entry => entry.project_id === projectId);
  }, [timeEntries]);

  const getTotalHoursForProject = useCallback((projectId: string) => {
    return timeEntries
      .filter(entry => entry.project_id === projectId)
      .reduce((total, entry) => total + entry.hours, 0);
  }, [timeEntries]);

  const addTimeEntry = useCallback(async (timeEntryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const newTimeEntry: TimeEntry = {
      ...timeEntryData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTimeEntries(prev => [...prev, newTimeEntry]);
    
    // Update project's hours_completed
    const totalHours = getTotalHoursForProject(timeEntryData.project_id) + timeEntryData.hours;
    setProjects(prev => prev.map(p => 
      p.id === timeEntryData.project_id 
        ? { ...p, hours_completed: totalHours, updated_at: new Date().toISOString() }
        : p
    ));
    
    return newTimeEntry;
  }, [getTotalHoursForProject]);

  const updateTimeEntry = useCallback(async (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updated_at: new Date().toISOString() }
        : entry
    ));
    
    // Recalculate project hours
    const updatedEntry = timeEntries.find(e => e.id === id);
    if (updatedEntry) {
      const totalHours = getTotalHoursForProject(updatedEntry.project_id);
      setProjects(prev => prev.map(p => 
        p.id === updatedEntry.project_id 
          ? { ...p, hours_completed: totalHours, updated_at: new Date().toISOString() }
          : p
      ));
    }
  }, [timeEntries, getTotalHoursForProject]);

  const deleteTimeEntry = useCallback(async (id: string) => {
    const entryToDelete = timeEntries.find(e => e.id === id);
    if (!entryToDelete) return;
    
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    
    // Recalculate project hours
    const totalHours = getTotalHoursForProject(entryToDelete.project_id) - entryToDelete.hours;
    setProjects(prev => prev.map(p => 
      p.id === entryToDelete.project_id 
        ? { ...p, hours_completed: Math.max(0, totalHours), updated_at: new Date().toISOString() }
        : p
    ));
  }, [timeEntries, getTotalHoursForProject]);

  return {
    projects,
    tasks,
    timeEntries,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    addProjectUpdate,
    deleteProject,
    getTasksForProject,
    updateProjectTasks,
    sortProjectsByNextDate,
    getTimeEntriesForProject,
    getTotalHoursForProject,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry
  };
};