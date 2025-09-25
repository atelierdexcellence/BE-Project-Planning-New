import { useState } from 'react';
import type { Project } from '../types';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Canapé Modulaire Premium',
    client: 'Hôtel Le Bristol',
    startInBE: '2024-02-01',
    deliveryDate: '2024-03-30',
    previewedHours: 120,
    pieces: 3,
    size: 'Large',
    geometry: 'Curved',
    targetCostConstraint: 'High',
    modelling: '3D',
    outsourcedSuppliers: 2,
    dLevel: 8
  },
  {
    id: '2',
    name: 'Fauteuils Direction Executive',
    client: 'Banque Rothschild',
    startInBE: '2024-02-05',
    deliveryDate: '2024-04-10',
    previewedHours: 95,
    pieces: 6,
    size: 'Medium',
    geometry: 'Mixed',
    targetCostConstraint: 'Moderate',
    modelling: '2D',
    outsourcedSuppliers: 1,
    dLevel: 6
  },
  {
    id: '3',
    name: 'Banquette Restaurant',
    client: 'Restaurant Le Meurice',
    startInBE: '2024-01-08',
    deliveryDate: '2024-03-15',
    previewedHours: 85,
    pieces: 8,
    size: 'Large',
    geometry: 'Curved',
    targetCostConstraint: 'Tight',
    modelling: '3D',
    outsourcedSuppliers: 3,
    dLevel: 9
  },
  {
    id: '4',
    name: 'Chaises Salle à Manger',
    client: 'Résidence Privée',
    startInBE: '2024-02-15',
    deliveryDate: '2024-04-20',
    previewedHours: 60,
    pieces: 12,
    size: 'Small',
    geometry: 'Square',
    targetCostConstraint: 'Moderate',
    modelling: '2D',
    outsourcedSuppliers: 0,
    dLevel: 4
  },
  {
    id: '5',
    name: 'Mobilier Bureau Présidentiel',
    client: 'Ministère des Finances',
    startInBE: '2024-03-01',
    deliveryDate: '2024-05-30',
    previewedHours: 200,
    pieces: 15,
    size: 'Large',
    geometry: 'Mixed',
    targetCostConstraint: 'High',
    modelling: '3D',
    outsourcedSuppliers: 4,
    dLevel: 7
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  return {
    projects,
    updateProject
  };
};