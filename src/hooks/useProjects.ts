import { useState } from 'react';
import type { Project, Meeting } from '../types';

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

const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Kick-off Meeting - Canapé Modulaire',
    project_id: '1',
    date: '2024-01-20',
    attendees: ['as', 'mr', 'virginie'],
    notes: 'Initial project discussion. Client requirements reviewed. Technical specifications defined.',
    photos: [],
    voice_notes: [],
    author_id: 'as',
    author_name: 'ALEXANDER SMITH',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Design Review - Executive Chairs',
    project_id: '2',
    date: '2024-01-25',
    attendees: ['aq', 'sr', 'virginie'],
    notes: 'Design concepts presented. Material selection discussed. Timeline confirmed.',
    photos: [],
    voice_notes: [],
    author_id: 'aq',
    author_name: 'ALEXIA QUENTIN',
    created_at: '2024-01-25T14:00:00Z',
    updated_at: '2024-01-25T14:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);

  const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setMeetings(prev => [...prev, newMeeting]);
    return newMeeting;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
    ));
  };

  const deleteMeeting = async (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  return {
    projects,
    meetings,
    createMeeting,
    updateMeeting,
    deleteMeeting
  };
};