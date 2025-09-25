export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'in_progress' | 'at_risk' | 'overdue' | 'completed' | 'on_hold';
  description?: string;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  created_at: string;
  updated_at: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_member' | 'commercial' | 'atelier';
  initials: string;
}

// Team members data
export const TEAM_MEMBERS: User[] = [
  { id: 'as', name: 'ALEXANDER SMITH', email: 'as@company.com', role: 'team_member', initials: 'AS' },
  { id: 'mr', name: 'MAËLYS DE LA RUÉE', email: 'mr@company.com', role: 'team_member', initials: 'MR' },
  { id: 'aq', name: 'ALEXIA QUENTIN', email: 'aq@company.com', role: 'team_member', initials: 'AQ' },
  { id: 'sr', name: 'STEPHANIE DE RORTHAYS', email: 'sr@company.com', role: 'team_member', initials: 'SR' },
  { id: 'ld', name: 'LITESH DHUNNOO', email: 'ld@company.com', role: 'team_member', initials: 'LD' },
  { id: 'ps', name: 'PASCALINE SOLEILHAC', email: 'ps@company.com', role: 'team_member', initials: 'PS' },
  { id: 'nr', name: 'NICHOLAS RASCO', email: 'nr@company.com', role: 'team_member', initials: 'NR' },
  { id: 'virginie', name: 'Virginie', email: 'virginie@company.com', role: 'commercial', initials: 'V' },
  { id: 'admin', name: 'Admin User', email: 'admin@company.com', role: 'admin', initials: 'AU' }
];