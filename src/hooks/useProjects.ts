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
    name: 'Analyse du Brief',
    category: 'analyse_brief',
    phase: 'pre_prod',
    start_date: '2024-02-01',
    end_date: '2024-02-03',
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
    name: 'Recherche Références',
    category: 'recherche_references',
    phase: 'pre_prod',
    start_date: '2024-02-04',
    end_date: '2024-02-08',
    assignee_id: 'mr',
    status: 'completed',
    progress: 100,
    dependencies: ['1'],
    order_index: 1,
    enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-08T16:30:00Z'
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
    description: 'Analyse du brief client et définition des spécifications techniques',
    task_category: 'analyse_brief',
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
    description: 'Recherche de références et création de moodboard',
    task_category: 'recherche_references',
    percentage_completed: 30,
    created_at: '2024-01-26T16:30:00Z',
    updated_at: '2024-01-26T16:30:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
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
  }

  return {
    projects,
    timeEntries,
    projectNotes,
    createProject,
    updateProject,
    deleteProject,
    getTasksForProject,
    updateProjectTasks,
    getTimeEntriesForProject,
    getTotalHoursForProject,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry
  };
};