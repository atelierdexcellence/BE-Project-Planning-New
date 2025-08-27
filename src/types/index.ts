export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member' | 'commercial' | 'atelier';
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'at_risk' | 'overdue' | 'completed' | 'on_hold';
  sub_category: 'dev_in_progress' | 'prod_with_be_tracking' | 'updates_nomenclature' | 'waiting_order' | 'completed';
  color: string;
  bc_order_number?: string;
  image_url?: string;
  client: string;
  collection_models: string;
  composition: string;
  date_of_brief: string;
  commercial_id: string;
  atelier: 'siegeair' | 'maison_fey_vannes' | 'maison_fey_paris' | 'ville' | 'mussy' | 'ae';
  be_team_member_ids: string[];
  key_dates: {
    start_in_be: string;
    wood_foam_launch: string;
    previewed_delivery: string;
    last_call: string;
  };
  hours_previewed: number;
  hours_completed: number;
  notes: ProjectNote[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  category: TaskCategory;
  phase: 'pre_prod' | 'prod';
  start_date: string;
  end_date: string;
  assignee_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  dependencies: string[];
  order: number;
  enabled: boolean;
}

export type TaskCategory = 
  | 'reunion_lancement'
  | 'be_plans_validation'
  | 'be_conception_3d'
  | 'be_prepa_fichiers'
  | 'commande_mousse'
  | 'reception_mousse'
  | 'decoupe_bois_montage'
  | 'reception_structure_bois'
  | 'mise_en_mousse'
  | 'reception_tissu'
  | 'confection'
  | 'tapisserie'
  | 'rdv_confort_validation'
  | 'compte_rendu'
  | 'modifs_bois_mousse'
  | 'nomenclature_bc';

export const TASK_CATEGORIES: { id: TaskCategory; phase: 'pre_prod' | 'prod' }[] = [
  { id: 'reunion_lancement', phase: 'pre_prod' },
  { id: 'be_plans_validation', phase: 'pre_prod' },
  { id: 'be_conception_3d', phase: 'pre_prod' },
  { id: 'be_prepa_fichiers', phase: 'pre_prod' },
  { id: 'commande_mousse', phase: 'prod' },
  { id: 'reception_mousse', phase: 'prod' },
  { id: 'decoupe_bois_montage', phase: 'prod' },
  { id: 'reception_structure_bois', phase: 'prod' },
  { id: 'mise_en_mousse', phase: 'prod' },
  { id: 'reception_tissu', phase: 'prod' },
  { id: 'confection', phase: 'prod' },
  { id: 'tapisserie', phase: 'prod' },
  { id: 'rdv_confort_validation', phase: 'prod' },
  { id: 'compte_rendu', phase: 'prod' },
  { id: 'modifs_bois_mousse', phase: 'prod' },
  { id: 'nomenclature_bc', phase: 'prod' }
];

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  type: 'update' | 'status_change' | 'alert' | 'general';
}

export interface TimeEntry {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  hours: number;
  date: string;
  description?: string;
  task_category?: TaskCategory;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  project_id: string;
  type: 'overdue_start' | 'upcoming_deadline' | 'status_update' | 'spec_change';
  message: string;
  read: boolean;
  created_at: string;
}

export const COMMERCIAL_USERS = [
  { id: 'virginie', name: 'Virginie', email: 'virginie@company.com' },
  { id: 'nicholas', name: 'Nicholas', email: 'nicholas@company.com' },
  { id: 'aurelie', name: 'Aurelie', email: 'aurelie@company.com' },
  { id: 'paul', name: 'Paul', email: 'paul@company.com' },
  { id: 'alain', name: 'Alain', email: 'alain@company.com' },
  { id: 'victoria', name: 'Victoria', email: 'victoria@company.com' },
  { id: 'anne-victorine', name: 'Anne-Victorine', email: 'anne-victorine@company.com' },
];

export const BE_TEAM_MEMBERS = [
  { id: 'as', name: 'ALEXANDER SMITH (AS)', email: 'as@company.com' },
  { id: 'mr', name: 'MAËLYS DE LA RUÉE (MR)', email: 'mr@company.com' },
  { id: 'aq', name: 'ALEXIA QUENTIN (AQ)', email: 'aq@company.com' },
  { id: 'sr', name: 'STEPHANIE DE RORTHAYS (SR)', email: 'sr@company.com' },
  { id: 'ld', name: 'LITESH DHUNNOO (LD)', email: 'ld@company.com' },
  { id: 'ps', name: 'PASCALINE SOLEILHAC (PS)', email: 'ps@company.com' },
  { id: 'nr', name: 'NICHOLAS RASCO (NR)', email: 'nr@company.com' },
];

export const ATELIERS = [
  { id: 'siegeair', name: 'Siegeair' },
  { id: 'maison_fey_vannes', name: 'Maison Fey Vannes' },
  { id: 'maison_fey_paris', name: 'Maison Fey Paris' },
  { id: 'ville', name: 'Ville' },
  { id: 'mussy', name: 'Mussy' },
  { id: 'ae', name: 'AE' },
];

export const PROJECT_SUB_CATEGORIES = [
  { id: 'dev_in_progress', name: 'Projets en cours de développement', priority: 1 },
  { id: 'prod_with_be_tracking', name: 'Projets lancés en prod avec suivi BE', priority: 2 },
  { id: 'updates_nomenclature', name: 'Mises à jour à faire / Nomenclature édition à faire + surveiller vie série', priority: 3 },
  { id: 'waiting_order', name: 'Projets en attente de commande', priority: 4 },
  { id: 'completed', name: 'Projets Terminés', priority: 5 }
] as const;