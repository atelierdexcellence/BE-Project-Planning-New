import { useState } from 'react';
import type { Project, Meeting } from '../types';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Canapé Modulaire Premium',
    client: 'Hôtel Le Bristol',
    status: 'in_progress',
    description: 'Canapé modulaire haut de gamme pour suite présidentielle',
    startDate: '2024-02-01',
    endDate: '2024-03-30',
    teamMembers: ['as', 'mr'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-26T14:30:00Z'
  },
  {
    id: '2',
    name: 'Fauteuils Direction Executive',
    client: 'Banque Rothschild',
    status: 'planning',
    description: 'Fauteuils de direction en cuir pour salle de conseil',
    startDate: '2024-02-05',
    endDate: '2024-04-10',
    teamMembers: ['aq', 'sr'],
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    id: '3',
    name: 'Banquette Restaurant',
    client: 'Restaurant Le Meurice',
    status: 'at_risk',
    description: 'Banquettes sur mesure pour restaurant gastronomique',
    startDate: '2024-01-08',
    endDate: '2024-03-15',
    teamMembers: ['ld', 'ps'],
    created_at: '2024-01-08T11:00:00Z',
    updated_at: '2024-01-26T12:15:00Z'
  }
];

const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Réunion de lancement - Canapé Modulaire',
    date: '2024-01-25',
    attendees: ['as', 'mr', 'virginie'],
    notes: 'Discussion des spécifications techniques et des contraintes de production.\n\nPoints clés:\n• Validation des dimensions finales\n• Choix des matériaux confirmé\n• Planning de production établi',
    photos: [
      {
        id: 'photo1',
        url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Esquisse initiale du canapé modulaire',
        timestamp: '2024-01-25T14:30:00Z'
      }
    ],
    voice_notes: [
      {
        id: 'voice1',
        transcript: 'Important de vérifier les dimensions avec le client avant production',
        duration: 45,
        timestamp: '2024-01-25T14:45:00Z'
      }
    ],
    author_id: 'as',
    author_name: 'ALEXANDER SMITH',
    created_at: '2024-01-25T15:00:00Z',
    updated_at: '2024-01-25T15:00:00Z'
  },
  {
    id: '2',
    project_id: '2',
    title: 'Validation Design - Fauteuils Direction',
    date: '2024-01-24',
    attendees: ['aq', 'sr', 'virginie'],
    notes: 'Présentation des maquettes 3D au client.\n\nRésultats:\n• Design approuvé avec modifications mineures\n• Ajustement de la hauteur du dossier\n• Validation des finitions cuir',
    photos: [
      {
        id: 'photo2',
        url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Maquette 3D présentée au client',
        timestamp: '2024-01-24T16:00:00Z'
      }
    ],
    voice_notes: [],
    author_id: 'aq',
    author_name: 'ALEXIA QUENTIN',
    created_at: '2024-01-24T17:00:00Z',
    updated_at: '2024-01-24T17:00:00Z'
  },
  {
    id: '3',
    project_id: '3',
    title: 'Point d\'avancement - Banquette Restaurant',
    date: '2024-01-26',
    attendees: ['ld', 'ps', 'nr'],
    notes: 'Revue de l\'avancement du projet et identification des risques.\n\nProblèmes identifiés:\n• Retard sur livraison tissu\n• Besoin de validation supplémentaire du client\n• Ajustement planning production',
    photos: [],
    voice_notes: [
      {
        id: 'voice2',
        transcript: 'Contacter le fournisseur de tissu pour accélérer la livraison',
        duration: 30,
        timestamp: '2024-01-26T10:30:00Z'
      },
      {
        id: 'voice3',
        transcript: 'Programmer une réunion client pour validation finale',
        duration: 25,
        timestamp: '2024-01-26T10:35:00Z'
      }
    ],
    author_id: 'ld',
    author_name: 'LITESH DHUNNOO',
    created_at: '2024-01-26T11:00:00Z',
    updated_at: '2024-01-26T11:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);

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

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
  };

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
    createProject,
    updateProject,
    createMeeting,
    updateMeeting,
    deleteMeeting
  };
};