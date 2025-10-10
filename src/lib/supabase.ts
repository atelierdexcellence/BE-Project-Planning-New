import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_PROJECT_ID = '55556544' // your project ref
const STORAGE_BUCKET = '22e17ebbb1dc3f37edcdb6489f7d8c10'
const BEARER_TOKEN = '1f66b03540884d0c92f2fba4a268f6e76e231cf7fca666e452a991fc62ea760e' // your bearer token

// Create a mock client if Supabase is not configured
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => {
        const mockQueryBuilder = {
          select: () => mockQueryBuilder,
          insert: () => mockQueryBuilder,
          update: () => mockQueryBuilder,
          delete: () => mockQueryBuilder,
          order: () => mockQueryBuilder,
          eq: () => mockQueryBuilder,
          single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          then: (resolve: any) => resolve({ data: [], error: null })
        };
        return mockQueryBuilder;
      }
    } as any;

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          status: string;
          sub_category: string;
          color: string;
          bc_order_number: string | null;
          image_url: string | null;
          client: string;
          collection_models: string;
          composition: string;
          date_of_brief: string;
          commercial_id: string;
          atelier: string;
          be_team_member_ids: string[];
          key_dates: any;
          hours_previewed: number;
          hours_completed: number;
          pieces: number;
          size: string;
          geometry: string;
          target_cost_constraint: string;
          modelling: string;
          outsourced_suppliers: number;
          d_level_override: number | null;
          d_level: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: string;
          sub_category?: string;
          color?: string;
          bc_order_number?: string | null;
          image_url?: string | null;
          client: string;
          collection_models?: string;
          composition?: string;
          date_of_brief: string;
          commercial_id: string;
          atelier?: string;
          be_team_member_ids?: string[];
          key_dates: any;
          hours_previewed?: number;
          hours_completed?: number;
          pieces?: number;
          size?: string;
          geometry?: string;
          target_cost_constraint?: string;
          modelling?: string;
          outsourced_suppliers?: number;
          d_level_override?: number | null;
          d_level?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          sub_category?: string;
          color?: string;
          bc_order_number?: string | null;
          image_url?: string | null;
          client?: string;
          collection_models?: string;
          composition?: string;
          date_of_brief?: string;
          commercial_id?: string;
          atelier?: string;
          be_team_member_ids?: string[];
          key_dates?: any;
          hours_previewed?: number;
          hours_completed?: number;
          pieces?: number;
          size?: string;
          geometry?: string;
          target_cost_constraint?: string;
          modelling?: string;
          outsourced_suppliers?: number;
          d_level_override?: number | null;
          d_level?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          category: string;
          phase: string;
          start_date: string | null;
          end_date: string | null;
          assignee_id: string | null;
          status: string;
          progress: number;
          dependencies: string[];
          order_index: number;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          category: string;
          phase: string;
          start_date?: string | null;
          end_date?: string | null;
          assignee_id?: string | null;
          status?: string;
          progress?: number;
          dependencies?: string[];
          order_index?: number;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          category?: string;
          phase?: string;
          start_date?: string | null;
          end_date?: string | null;
          assignee_id?: string | null;
          status?: string;
          progress?: number;
          dependencies?: string[];
          order_index?: number;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          user_name: string;
          hours: number;
          date: string;
          description: string;
          task_category: string | null;
          percentage_completed: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          user_name: string;
          hours: number;
          date: string;
          description?: string;
          task_category?: string | null;
          percentage_completed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          user_name?: string;
          hours?: number;
          date?: string;
          description?: string;
          task_category?: string | null;
          percentage_completed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meetings: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          date: string;
          attendees: string[];
          notes: string;
          photos: any;
          voice_notes: any;
          author_id: string;
          author_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          date: string;
          attendees?: string[];
          notes?: string;
          photos?: any;
          voice_notes?: any;
          author_id: string;
          author_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          date?: string;
          attendees?: string[];
          notes?: string;
          photos?: any;
          voice_notes?: any;
          author_id?: string;
          author_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_notes: {
        Row: {
          id: string;
          project_id: string;
          content: string;
          author_id: string;
          author_name: string;
          type: string;
          meeting_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          content: string;
          author_id: string;
          author_name: string;
          type?: string;
          meeting_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          content?: string;
          author_id?: string;
          author_name?: string;
          type?: string;
          meeting_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
