export interface Project {
  id: string;
  name: string;
  client: string;
  startInBE: string;
  deliveryDate: string;
  previewedHours: number;
  pieces: number;
  size: 'Small' | 'Medium' | 'Large';
  geometry: 'Square' | 'Mixed' | 'Curved';
  targetCostConstraint: 'High' | 'Moderate' | 'Tight';
  modelling: '2D' | '3D';
  outsourcedSuppliers: number;
  dLevelOverride?: number;
  dLevel?: number;
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