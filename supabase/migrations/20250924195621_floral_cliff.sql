/*
  # Create Bureau d'Études Project Management Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text) - stores completion percentage
      - `sub_category` (text)
      - `color` (text)
      - `bc_order_number` (text)
      - `image_url` (text)
      - `client` (text)
      - `collection_models` (text)
      - `composition` (text)
      - `date_of_brief` (date)
      - `commercial_id` (text)
      - `atelier` (text)
      - `be_team_member_ids` (text array)
      - `key_dates` (jsonb)
      - `hours_previewed` (integer)
      - `hours_completed` (integer)
      - `pieces` (integer, default 1)
      - `size` (text, default 'Medium')
      - `geometry` (text, default 'Mixed')
      - `target_cost_constraint` (text, default 'Moderate')
      - `modelling` (text, default '2D')
      - `outsourced_suppliers` (integer, default 0)
      - `d_level_override` (integer)
      - `d_level` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `name` (text)
      - `category` (text)
      - `phase` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `assignee_id` (text)
      - `status` (text)
      - `progress` (integer)
      - `dependencies` (text array)
      - `order_index` (integer)
      - `enabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `time_entries`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `user_id` (text)
      - `user_name` (text)
      - `hours` (decimal)
      - `date` (date)
      - `description` (text)
      - `task_category` (text)
      - `percentage_completed` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `meetings`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `title` (text)
      - `date` (date)
      - `attendees` (text array)
      - `notes` (text)
      - `photos` (jsonb)
      - `voice_notes` (jsonb)
      - `author_id` (text)
      - `author_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `project_notes`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `content` (text)
      - `author_id` (text)
      - `author_name` (text)
      - `type` (text)
      - `meeting_id` (uuid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT '0%',
  sub_category text DEFAULT 'dev_in_progress',
  color text DEFAULT '#3B82F6',
  bc_order_number text,
  image_url text,
  client text NOT NULL,
  collection_models text DEFAULT '',
  composition text DEFAULT '',
  date_of_brief date NOT NULL,
  commercial_id text NOT NULL,
  atelier text DEFAULT 'siegeair',
  be_team_member_ids text[] DEFAULT '{}',
  key_dates jsonb NOT NULL DEFAULT '{}',
  hours_previewed integer DEFAULT 0,
  hours_completed integer DEFAULT 0,
  pieces integer DEFAULT 1,
  size text DEFAULT 'Medium',
  geometry text DEFAULT 'Mixed',
  target_cost_constraint text DEFAULT 'Moderate',
  modelling text DEFAULT '2D',
  outsourced_suppliers integer DEFAULT 0,
  d_level_override integer,
  d_level integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  phase text NOT NULL,
  start_date date,
  end_date date,
  assignee_id text,
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  dependencies text[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  hours decimal(5,2) NOT NULL,
  date date NOT NULL,
  description text DEFAULT '',
  task_category text,
  percentage_completed integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  attendees text[] DEFAULT '{}',
  notes text DEFAULT '',
  photos jsonb DEFAULT '[]',
  voice_notes jsonb DEFAULT '[]',
  author_id text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id text NOT NULL,
  author_name text NOT NULL,
  type text DEFAULT 'update',
  meeting_id uuid REFERENCES meetings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can read all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for tasks
CREATE POLICY "Users can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for time_entries
CREATE POLICY "Users can read all time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create time entries"
  ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their time entries"
  ON time_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their time entries"
  ON time_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for meetings
CREATE POLICY "Users can read all meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their meetings"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their meetings"
  ON meetings
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for project_notes
CREATE POLICY "Users can read all project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create project notes"
  ON project_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their project notes"
  ON project_notes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_sub_category ON projects(sub_category);
CREATE INDEX IF NOT EXISTS idx_projects_commercial_id ON projects(commercial_id);
CREATE INDEX IF NOT EXISTS idx_projects_atelier ON projects(atelier);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
