import { useState } from 'react';
import type { Project, Meeting, Task, TimeEntry, ProjectNote } from '../types';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Canapé Modulaire Premium',
    client: 'Hôtel Le Bristol',
    status: 'in_progress',
    sub_category: 'seating',
    color: '#3B82F6',
    bc_order_number: 'BC2024-001',
    image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
    collection_models: 'Collection Prestige',
    composition: 'Canapé 3 places modulaire',
    date_of_brief: '2024-01-15',
    commercial_id: 'virginie',
    atelier: 'paris',
    be_team_member_ids: ['as', 'mr'],
    key_dates: {
      start_in_be: '2024-02-01',
      wood_foam_launch: '2024-02-15',
      previewed_delivery: '2024-03-30',
      last_call: '2024-04-05'
    },
    hours_previewed: 120,
    hours_completed: 85,
    pieces: 3,
    size: 'Large',
    geometry: 'Curved',
    target_cost_constraint: 'Moderate',
    modelling: '3D',
    outsourced_suppliers: 2,
    d_level_override: null,
    d_level: 7,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-26T14:30:00Z'
  },
  {
    id: '2',
    name: 'Fauteuils Direction Executive',
    client: 'Banque Rothschild',
    status: 'planning',
    sub_category: 'seating',
    color: '#10B981',
    bc_order_number: 'BC2024-002',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    collection_models: 'Collection Executive',
    composition: 'Fauteuils de direction en cuir',
    date_of_brief: '2024-01-20',
    commercial_id: 'virginie',
    atelier: 'lyon',
    be_team_member_ids: ['aq', 'sr'],
    key_dates: {
      start_in_be: '2024-02-05',
      wood_foam_launch: '2024-02-20',
      previewed_delivery: '2024-04-10',
      last_call: '2024-04-15'
    },
    hours_previewed: 80,
    hours_completed: 15,
    pieces: 6,
    size: 'Medium',
    geometry: 'Mixed',
    target_cost_constraint: 'High',
    modelling: '3D',
    outsourced_suppliers: 1,
    d_level_override: null,
    d_level: 6,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    id: '3',
    name: 'Banquette Restaurant Gastronomique',
    client: 'Restaurant Le Meurice',
    status: 'at_risk',
    sub_category: 'seating',
    color: '#F59E0B',
    bc_order_number: 'BC2024-003',
    image_url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400',
    collection_models: 'Collection Restaurant',
    composition: 'Banquettes sur mesure',
    date_of_brief: '2024-01-08',
    commercial_id: 'virginie',
    atelier: 'marseille',
    be_team_member_ids: ['ld', 'ps'],
    key_dates: {
      start_in_be: '2024-01-22',
      wood_foam_launch: '2024-02-05',
      previewed_delivery: '2024-03-15',
      last_call: '2024-03-20'
    },
    hours_previewed: 150,
    hours_completed: 95,
    pieces: 12,
    size: 'Large',
    geometry: 'Curved',
    target_cost_constraint: 'Tight',
    modelling: '3D',
    outsourced_suppliers: 3,
    d_level_override: null,
    d_level: 9,
    created_at: '2024-01-08T11:00:00Z',
    updated_at: '2024-01-26T12:15:00Z'
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    project_id: '1',
    name: 'BE plans pour validation',
    category: 'be_plans_validation',
    phase: 'pre_prod',
    duration_days: 7,
    start_date: '2024-02-01',
    end_date: '2024-02-08',
    assignee_id: 'as',
    status: 'completed',
    progress: 100,
    dependencies: [],
    order_index: 0,
    enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-03T17:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    name: 'BE étude conception',
    category: 'be_etude_conception',
    phase: 'pre_prod',
    duration_days: 7,
    start_date: '2024-02-09',
    end_date: '2024-02-16',
    assignee_id: 'mr',
    status: 'completed',
    progress: 100,
    dependencies: ['1'],
    order_index: 1,
    enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-08T16:30:00Z'
  },
  {
    id: '3',
    project_id: '1',
    name: 'Commande mousse',
    category: 'commande_mousse',
    phase: 'prod',
    duration_days: 1,
    start_date: '2024-02-17',
    end_date: '2024-02-17',
    assignee_id: 'as',
    status: 'in_progress',
    progress: 50,
    dependencies: ['2'],
    order_index: 2,
    enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-17T10:00:00Z'
  },
  {
    id: '4',
    project_id: '1',
    name: 'Découpe bois + montage',
    category: 'decoupe_bois_montage',
    phase: 'prod',
    duration_days: 7,
    start_date: '2024-02-20',
    end_date: '2024-02-27',
    assignee_id: 'mr',
    status: 'pending',
    progress: 0,
    dependencies: ['3'],
    order_index: 3,
    enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-17T10:00:00Z'
  },
  {
    id: '5',
    project_id: '1',
    name: 'Tapisserie',
    category: 'tapisserie',
    phase: 'prod',
    duration_days: 7,
    start_date: '2024-03-15',
    end_date: '2024-03-22',
    assignee_id: 'as',
    status: 'pending',
    progress: 0,
    dependencies: ['4'],
    order_index: 4,
    enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-17T10:00:00Z'
  }
];

const MOCK_TIME_ENTRIES: TimeEntry[] = [
  {
    id: '1',
    project_id: '1',
    user_id: 'as',
    user_name: 'ALEXANDER SMITH',
    hours: 8,
    date: '2024-01-26',
    description: 'BE plans pour validation client',
    task_category: 'be_plans_validation',
    percentage_completed: 25,
    created_at: '2024-01-26T17:00:00Z',
    updated_at: '2024-01-26T17:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    user_id: 'mr',
    user_name: 'MAËLYS DE LA RUÉE',
    hours: 6,
    date: '2024-01-26',
    description: 'BE étude conception 3D',
    task_category: 'be_etude_conception',
    percentage_completed: 30,
    created_at: '2024-01-26T16:30:00Z',
    updated_at: '2024-01-26T16:30:00Z'
  }
];

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    project_id: '1',
    title: 'Kickoff - Canapé Modulaire',
    date: '2024-02-05',
    attendees: ['as','mr'],
    notes: 'Initial kickoff meeting for Canapé project',
    photos: [],
    voice_notes: [],
    author_id: 'virginie',
    author_name: 'Virginie',
    created_at: '2024-02-05T10:00:00Z',
    updated_at: '2024-02-05T10:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(MOCK_TIME_ENTRIES);
  const [projectNotes, setProjectNotes] = useState<ProjectNote[]>([]);

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }

  const updateProject = async (projectId: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updated_at: new Date().toISOString() } as Project : p));
    return true;
  };

  // Meetings CRUD
  const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
    const newMeeting: Meeting = { ...meetingData, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setMeetings(prev => [newMeeting, ...prev]);
    return newMeeting;
  };

  const updateMeeting = async (meetingId: string, updates: Partial<Omit<Meeting, 'id' | 'created_at' | 'updated_at'>>) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, ...updates, updated_at: new Date().toISOString() } as Meeting : m));
    return true;
  };

  const deleteMeeting = async (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    return true;
  };

  const deleteProject = async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    return true;
  };

  const getTasksForProject = (projectId: string) => tasks.filter(t => t.project_id === projectId);

  const updateProjectTasks = async (projectId: string, updatedTasks: Task[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;

    // Create a map for quick task lookup
    const taskMap = new Map<string, Task>();
    updatedTasks.forEach(task => taskMap.set(task.id, task));

    // Function to calculate start date based on dependencies
    const calculateStartDate = (task: Task): Date => {
      // If task has dependencies, start after the latest dependency ends
      if (task.dependencies && task.dependencies.length > 0) {
        let latestEndDate = new Date(project.key_dates.start_in_be);

        task.dependencies.forEach(depId => {
          const depTask = taskMap.get(depId);
          if (depTask && depTask.end_date) {
            const depEndDate = new Date(depTask.end_date);
            if (depEndDate > latestEndDate) {
              latestEndDate = depEndDate;
            }
          }
        });

        // Start the day after the latest dependency ends
        latestEndDate.setDate(latestEndDate.getDate() + 1);
        return latestEndDate;
      }

      // No dependencies - use existing start date or project start
      if (task.start_date) {
        return new Date(task.start_date);
      }

      return new Date(project.key_dates.start_in_be);
    };

    // Recalculate dates for all tasks, respecting dependencies
    const tasksWithDates = updatedTasks.map((task) => {
      const startDate = calculateStartDate(task);

      // Calculate end date based on duration
      // For a 1-day task, start and end should be the same day
      // For a 7-day task, end should be 6 days after start (inclusive counting)
      const endDate = new Date(startDate);
      const daysToAdd = Math.max(Math.ceil(task.duration_days) - 1, 0);
      endDate.setDate(endDate.getDate() + daysToAdd);

      return {
        ...task,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      };
    });

    // Remove old tasks for project and add updated ones
    setTasks(prev => [...prev.filter(t => t.project_id !== projectId), ...tasksWithDates]);
    return true;
  };

  const getTimeEntriesForProject = (projectId: string) => timeEntries.filter(e => e.project_id === projectId);

  const getTotalHoursForProject = (projectId: string) => {
    return timeEntries.filter(e => e.project_id === projectId).reduce((sum, e) => sum + e.hours, 0);
  };

  const addTimeEntry = async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const newEntry: TimeEntry = { ...entry, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as TimeEntry;
    setTimeEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateTimeEntry = async (entryId: string, updates: Partial<Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>>) => {
    setTimeEntries(prev => prev.map(e => e.id === entryId ? { ...e, ...updates, updated_at: new Date().toISOString() } as TimeEntry : e));
    return true;
  };

  const deleteTimeEntry = async (entryId: string) => {
    setTimeEntries(prev => prev.filter(e => e.id !== entryId));
    return true;
  };

  const sortProjectsByNextDate = (projectsList: Project[]) => {
    return [...projectsList].sort((a, b) => new Date(a.key_dates.start_in_be).getTime() - new Date(b.key_dates.start_in_be).getTime());
  };

  const addProjectUpdate = async (projectId: string, content: string, authorId: string, authorName: string) => {
    const newNote: ProjectNote = {
      id: Date.now().toString(),
      project_id: projectId,
      content,
      author_id: authorId,
      author_name: authorName,
      type: 'update',
      created_at: new Date().toISOString()
    };
    setProjectNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  return {
    projects,
    meetings,
    tasks,
    timeEntries,
    projectNotes,
    createProject,
    updateProject,
    deleteProject,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getTasksForProject,
    updateProjectTasks,
    getTimeEntriesForProject,
    getTotalHoursForProject,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    sortProjectsByNextDate,
    addProjectUpdate
  };
};
