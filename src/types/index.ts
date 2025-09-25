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