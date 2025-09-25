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
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member' | 'commercial' | 'atelier';
  initials: string;
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
  created_at: string;
  updated_at: string;
}

export interface MeetingPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp: string;
}

export interface VoiceNote {
  id: string;
  transcript: string;
  duration: number;
  timestamp: string;
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
  percentage_completed?: number;
  created_at: string;
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
  | 'general'
  | 'brief_analysis'
  | 'technical_drawing'
  | 'cutting_list'
  | 'supplier_research'
  | 'cost_estimation'
  | 'client_validation'
  | 'production_planning'
  | 'quality_control'
  | 'delivery_coordination'
  | 'reception_mousse'
  | 'decoupe_bois_montage'
  | 'reception_structure_bois'
  | 'mise_en_mousse'
  | 'reception_tissu'
  | 'confection'
  | 'tapisserie';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  userId: string;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface DLevelWeights {
  W_Geometry: number;
  W_Pieces: number;
  W_Size: number;
  W_Urgency: number;
  W_Cost: number;
  W_Modelling: number;
  W_Outsourcing: number;
  W_PreviewedHours: number;
}

export interface DLevelReferences {
  LeadTimeRefDays: number;
  PreviewedHoursRef: number;
  PiecesCap: number;
}

export interface DLevelBreakdown {
  piecesScore: number;
  sizeScore: number;
  geometryScore: number;
  urgencyScore: number;
  costScore: number;
  modellingScore: number;
  outsourcingScore: number;
  previewedHoursScore: number;
  weightedSum: number;
  finalDLevel: number;
}

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
  { id: 'virginie', name: 'Virginie', email: 'virginie@company.com', role: 'commercial' as const, initials: 'V' }
];

export const TEAM_MEMBERS = [
  ...BE_TEAM_MEMBERS,
  ...COMMERCIAL_USERS,
  { id: 'admin', name: 'Admin User', email: 'admin@company.com', role: 'admin' as const, initials: 'AU' }
];

// Ateliers
export const ATELIERS = [
  { id: 'paris', name: 'Paris' },
  { id: 'lyon', name: 'Lyon' },
  { id: 'marseille', name: 'Marseille' }
];

// Project Sub-Categories
export const PROJECT_SUB_CATEGORIES = [
  { id: 'seating', name: 'Seating', priority: 1 },
  { id: 'tables', name: 'Tables', priority: 2 },
  { id: 'storage', name: 'Storage', priority: 3 },
  { id: 'lighting', name: 'Lighting', priority: 4 },
  { id: 'accessories', name: 'Accessories', priority: 5 }
];

// Task Categories
export const TASK_CATEGORIES = [
  { id: 'general', phase: 'pre_prod' as const },
  { id: 'brief_analysis', phase: 'pre_prod' as const },
  { id: 'technical_drawing', phase: 'pre_prod' as const },
  { id: 'cutting_list', phase: 'pre_prod' as const },
  { id: 'supplier_research', phase: 'pre_prod' as const },
  { id: 'cost_estimation', phase: 'pre_prod' as const },
  { id: 'client_validation', phase: 'pre_prod' as const },
  { id: 'production_planning', phase: 'prod' as const },
  { id: 'quality_control', phase: 'prod' as const },
  { id: 'delivery_coordination', phase: 'prod' as const },
  { id: 'reception_mousse', phase: 'prod' as const },
  { id: 'decoupe_bois_montage', phase: 'prod' as const },
  { id: 'reception_structure_bois', phase: 'prod' as const },
  { id: 'mise_en_mousse', phase: 'prod' as const },
  { id: 'reception_tissu', phase: 'prod' as const },
  { id: 'confection', phase: 'prod' as const },
  { id: 'tapisserie', phase: 'prod' as const }
];