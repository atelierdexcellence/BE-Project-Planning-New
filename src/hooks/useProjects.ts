import { useState } from 'react';
import type { Project } from '../types';

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
  },
  {
    id: '4',
    name: 'Chaises Salle à Manger',
    client: 'Résidence Privée',
    status: 'completed',
    sub_category: 'seating',
    color: '#10B981',
    bc_order_number: 'BC2023-045',
    image_url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400',
    collection_models: 'Collection Classique',
    composition: 'Chaises en bois massif',
    date_of_brief: '2023-12-01',
    commercial_id: 'virginie',
    atelier: 'paris',
    be_team_member_ids: ['nr'],
    key_dates: {
      start_in_be: '2023-12-15',
      wood_foam_launch: '2024-01-05',
      previewed_delivery: '2024-02-15',
      last_call: '2024-02-20'
    },
    hours_previewed: 60,
    hours_completed: 58,
    pieces: 8,
    size: 'Small',
    geometry: 'Square',
    target_cost_constraint: 'Moderate',
    modelling: '2D',
    outsourced_suppliers: 0,
    d_level_override: null,
    d_level: 4,
    created_at: '2023-12-01T14:00:00Z',
    updated_at: '2024-02-20T10:30:00Z'
  },
  {
    id: '5',
    name: 'Table Conférence Ovale',
    client: 'Cabinet d\'Avocats',
    status: 'planning',
    sub_category: 'tables',
    color: '#8B5CF6',
    bc_order_number: 'BC2024-004',
    image_url: 'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=400',
    collection_models: 'Collection Professionnelle',
    composition: 'Table ovale en noyer',
    date_of_brief: '2024-01-25',
    commercial_id: 'virginie',
    atelier: 'lyon',
    be_team_member_ids: ['as', 'aq'],
    key_dates: {
      start_in_be: '2024-02-10',
      wood_foam_launch: '2024-02-25',
      previewed_delivery: '2024-04-20',
      last_call: '2024-04-25'
    },
    hours_previewed: 100,
    hours_completed: 0,
    pieces: 1,
    size: 'Large',
    geometry: 'Curved',
    target_cost_constraint: 'High',
    modelling: '3D',
    outsourced_suppliers: 1,
    d_level_override: 8,
    d_level: 6,
    created_at: '2024-01-25T16:00:00Z',
    updated_at: '2024-01-25T16:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  return {
    projects,
    updateProject,
    createProject
  };
};