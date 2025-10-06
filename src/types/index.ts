export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'in_progress' | 'at_risk' | 'overdue' | 'completed' | 'on_hold';
  sub_category: string;
  color: string;
  bc_order_number: string | null;
  image_url: string | null;
  collection_models: string;
  composition: string;
  date_of_brief: string;
  commercial_id: string;
  atelier: string;
  be_team_member_ids: string[];
  key_dates: {
    start_in_be: string;
    wood_foam_launch: string;
    previewed_delivery: string;
    last_call: string;
  };
  hours_previewed: number;
  hours_completed: number;
  pieces: number;
  size: 'Small' | 'Medium' | 'Large';
  geometry: 'Square' | 'Mixed' | 'Curved';
  target_cost_constraint: 'High' | 'Moderate' | 'Tight';
  modelling: '2D' | '3D';
  outsourced_suppliers: number;
  d_level_override: number | null;
  d_level: number | null;
  created_at: string;
  updated_at?: string;
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
  progress?: number;
  dependencies: string[];
  order_index: number;
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}
export interface TimeEntry {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  hours: number;
  date: string;
  description: string;
  task_category?: TaskCategory;
  percentage_completed?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  author_id: string;
  author_name: string;
  type: 'update' | 'meeting';
  meeting_id?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  project_id: string;
  type: 'overdue_start' | 'upcoming_deadline' | 'status_update';
  message: string;
  read: boolean;
  created_at: string;
}

export type Language = 'en' | 'fr';

export type TaskCategory = 
  | 'general'
  | 'analyse_brief'
  | 'recherche_references'
  | 'esquisse_croquis'
  | 'plan_2d'
  | 'plan_3d'
  | 'fiche_technique'
  | 'devis_fournisseurs'
  | 'commande_fournisseurs'
  | 'suivi_livraisons'
  | 'reception_mousse'
  | 'decoupe_bois_montage'
  | 'reception_structure_bois'
  | 'mise_en_mousse'
  | 'reception_tissu'
  | 'confection'
  | 'tapisserie';

// Team Members
export const BE_TEAM_MEMBERS = [
  { id: 'as', name: 'ALEXANDER SMITH', email: 'as@company.com', role: 'team_member' as const, initials: 'AS' },
  { id: 'mr', name: 'MAËLYS DE LA RUÉE', email: 'mr@company.com', role: 'team_member' as const, initials: 'MR' },
  { id: 'aq', name: 'ALEXIA QUENTIN', email: 'aq@company.com', role: 'team_member' as const, initials: 'AQ' },
  { id: 'sr', name: 'STEPHANIE DE RORTHAYS', email: 'sr@company.com', role: 'team_member' as const, initials: 'SR' },
  { id: 'ld', name: 'LITESH DHUNNOO', email: 'ld@company.com', role: 'team_member' as const, initials: 'LD' },
  { id: 'ps', name: 'PASCALINE SOLEILHAC', email: 'ps@company.com', role: 'team_member' as const, initials: 'PS' },
  { id: 'nr', name: 'NICHOLAS RASCO', email: 'nr@company.com', role: 'team_member' as const, initials: 'NR' }
];

export const COMMERCIAL_USERS = [
  { id: 'virginie', name: 'Virginie', email: 'virginie@company.com', role: 'commercial' as const, initials: 'V' },
  { id: 'nicholas', name: 'Nicholas', email: 'nicholas@company.com', role: 'commercial' as const, initials: 'N' },
  { id: 'aurelie', name: 'Aurelie', email: 'aurelie@company.com', role: 'commercial' as const, initials: 'A' },
  { id: 'alain', name: 'Alain', email: 'alain@company.com', role: 'commercial' as const, initials: 'A' },
  { id: 'paul', name: 'Paul', email: 'paul@company.com', role: 'commercial' as const, initials: 'P' },
  { id: 'victoria', name: 'Victoria', email: 'victoria@company.com', role: 'commercial' as const, initials: 'V' },
  { id: 'anne_victorine', name: 'Anne-Victorine', email: 'anne-victorine@company.com', role: 'commercial' as const, initials: 'AV' },
  { id: 'laurie', name: 'Laurie', email: 'laurie@company.com', role: 'commercial' as const, initials: 'L' }
];

export const TEAM_MEMBERS = [
  ...BE_TEAM_MEMBERS,
  ...COMMERCIAL_USERS,
  { id: 'admin', name: 'Admin User', email: 'admin@company.com', role: 'admin' as const, initials: 'AU' }
];

export const ATELIERS = [
  { id: 'paris', name: 'Paris' },
  { id: 'lyon', name: 'Lyon' },
  { id: 'marseille', name: 'Marseille' },
  { id: 'siegeair', name: 'Siège Air' }
];

export const PROJECT_SUB_CATEGORIES = [
  { id: 'dev_in_progress', name: 'Development in Progress', priority: 1 },
  { id: 'prod_with_be_tracking', name: 'Production with BE Tracking', priority: 2 },
  { id: 'to_update', name: 'To Update', priority: 3 },
  { id: 'on_hold', name: 'On Hold', priority: 4 },
  { id: 'waiting_be_launch', name: 'Waiting BE Launch', priority: 5 },
  { id: 'completed', name: 'Completed', priority: 6 },
  { id: 'extracurricular', name: 'Extracurricular', priority: 7 }
];

export const TASK_CATEGORIES = [
  { id: 'general', phase: 'pre_prod' as const },
  { id: 'analyse_brief', phase: 'pre_prod' as const },
  { id: 'recherche_references', phase: 'pre_prod' as const },
  { id: 'esquisse_croquis', phase: 'pre_prod' as const },
  { id: 'plan_2d', phase: 'pre_prod' as const },
  { id: 'plan_3d', phase: 'pre_prod' as const },
  { id: 'fiche_technique', phase: 'pre_prod' as const },
  { id: 'devis_fournisseurs', phase: 'pre_prod' as const },
  { id: 'commande_fournisseurs', phase: 'prod' as const },
  { id: 'suivi_livraisons', phase: 'prod' as const },
  { id: 'reception_mousse', phase: 'prod' as const },
  { id: 'decoupe_bois_montage', phase: 'prod' as const },
  { id: 'reception_structure_bois', phase: 'prod' as const },
  { id: 'mise_en_mousse', phase: 'prod' as const },
  { id: 'reception_tissu', phase: 'prod' as const },
  { id: 'confection', phase: 'prod' as const },
  { id: 'tapisserie', phase: 'prod' as const }
];

// Meeting related types
export interface MeetingPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp?: string;
}

export interface VoiceNote {
  id: string;
  transcript?: string;
  duration: number;
  timestamp: string;
}

export interface Meeting {
  id: string;
  project_id: string;
  title: string;
  date: string;
  attendees: string[];
  notes: string;
  photos: MeetingPhoto[];
  voice_notes: VoiceNote[];
  author_id: string;
  author_name: string;
  created_at?: string;
  updated_at?: string;
}
