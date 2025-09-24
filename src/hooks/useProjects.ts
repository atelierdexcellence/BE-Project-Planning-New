import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, Task, TimeEntry, Meeting, ProjectNote } from '../types';

// Convert database row to Project type
const dbRowToProject = (row: any): Project => ({
  id: row.id,
  name: row.name,
  status: row.status,
  sub_category: row.sub_category,
  color: row.color,
  bc_order_number: row.bc_order_number,
  image_url: row.image_url,
  client: row.client,
  collection_models: row.collection_models,
  composition: row.composition,
  date_of_brief: row.date_of_brief,
  commercial_id: row.commercial_id,
  atelier: row.atelier,
  be_team_member_ids: row.be_team_member_ids,
  key_dates: row.key_dates,
  hours_previewed: row.hours_previewed,
  hours_completed: row.hours_completed,
  notes: [], // Will be loaded separately
  created_at: row.created_at,
  updated_at: row.updated_at
});

// Convert database row to Task type
const dbRowToTask = (row: any): Task => ({
  id: row.id,
  project_id: row.project_id,
  name: row.name,
  category: row.category,
  phase: row.phase,
  start_date: row.start_date || '',
  end_date: row.end_date || '',
  assignee_id: row.assignee_id || '',
  status: row.status,
  progress: row.progress,
  dependencies: row.dependencies,
  order: row.order_index,
  enabled: row.enabled
});

// Convert database row to TimeEntry type
const dbRowToTimeEntry = (row: any): TimeEntry => ({
  id: row.id,
  project_id: row.project_id,
  user_id: row.user_id,
  user_name: row.user_name,
  hours: parseFloat(row.hours),
  date: row.date,
  description: row.description || '',
  task_category: row.task_category,
  percentage_completed: row.percentage_completed,
  created_at: row.created_at,
  updated_at: row.updated_at
});

// Convert database row to Meeting type
const dbRowToMeeting = (row: any): Meeting => ({
  id: row.id,
  project_id: row.project_id,
  title: row.title,
  date: row.date,
  attendees: row.attendees,
  notes: row.notes,
  photos: row.photos,
  voice_notes: row.voice_notes,
  author_id: row.author_id,
  author_name: row.author_name,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchTimeEntries(),
        fetchMeetings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithNotes = await Promise.all(
        (data || []).map(async (project) => {
          const { data: notes } = await supabase
            .from('project_notes')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false });

          return {
            ...dbRowToProject(project),
            notes: notes || []
          };
        })
      );

      setProjects(projectsWithNotes);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTasks((data || []).map(dbRowToTask));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  const fetchTimeEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTimeEntries((data || []).map(dbRowToTimeEntry));
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMeetings((data || []).map(dbRowToMeeting));
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  }, []);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          status: projectData.status,
          sub_category: projectData.sub_category,
          color: projectData.color,
          bc_order_number: projectData.bc_order_number,
          image_url: projectData.image_url,
          client: projectData.client,
          collection_models: projectData.collection_models,
          composition: projectData.composition,
          date_of_brief: projectData.date_of_brief,
          commercial_id: projectData.commercial_id,
          atelier: projectData.atelier,
          be_team_member_ids: projectData.be_team_member_ids,
          key_dates: projectData.key_dates,
          hours_previewed: projectData.hours_previewed,
          hours_completed: projectData.hours_completed
        }])
        .select()
        .single();

      if (error) throw error;

      const newProject = { ...dbRowToProject(data), notes: [] };
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(p => 
        p.id === id 
          ? { ...p, ...updates, updated_at: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, []);

  const addProjectUpdate = useCallback(async (projectId: string, content: string, authorId: string, authorName: string) => {
    try {
      const { data, error } = await supabase
        .from('project_notes')
        .insert([{
          project_id: projectId,
          content,
          author_id: authorId,
          author_name: authorName,
          type: 'update'
        }])
        .select()
        .single();

      if (error) throw error;

      const newUpdate: ProjectNote = {
        id: data.id,
        project_id: data.project_id,
        content: data.content,
        author_id: data.author_id,
        author_name: data.author_name,
        created_at: data.created_at,
        type: data.type,
        meeting_id: data.meeting_id
      };

      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, notes: [newUpdate, ...p.notes], updated_at: new Date().toISOString() }
          : p
      ));

      return newUpdate;
    } catch (error) {
      console.error('Error adding project update:', error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, []);

  const getTasksForProject = useCallback((projectId: string) => {
    return tasks
      .filter(task => task.project_id === projectId && task.enabled)
      .sort((a, b) => a.order - b.order);
  }, [tasks]);

  const updateProjectTasks = useCallback(async (projectId: string, updatedTasks: Task[]) => {
    try {
      // Delete existing tasks for this project
      await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

      // Insert new tasks
      if (updatedTasks.length > 0) {
        const { error } = await supabase
          .from('tasks')
          .insert(updatedTasks.map(task => ({
            id: task.id,
            project_id: task.project_id,
            name: task.name,
            category: task.category,
            phase: task.phase,
            start_date: task.start_date || null,
            end_date: task.end_date || null,
            assignee_id: task.assignee_id || null,
            status: task.status,
            progress: task.progress,
            dependencies: task.dependencies,
            order_index: task.order,
            enabled: task.enabled
          })));

        if (error) throw error;
      }

      setTasks(prev => [
        ...prev.filter(task => task.project_id !== projectId),
        ...updatedTasks
      ]);
    } catch (error) {
      console.error('Error updating project tasks:', error);
      throw error;
    }
  }, []);

  const sortProjectsByNextDate = useCallback((projects: Project[]) => {
    return [...projects].sort((a, b) => {
      const nextDateA = new Date(Math.min(
        new Date(a.key_dates.start_in_be).getTime(),
        new Date(a.key_dates.wood_foam_launch).getTime(),
        new Date(a.key_dates.previewed_delivery).getTime(),
        new Date(a.key_dates.last_call).getTime()
      ));
      const nextDateB = new Date(Math.min(
        new Date(b.key_dates.start_in_be).getTime(),
        new Date(b.key_dates.wood_foam_launch).getTime(),
        new Date(b.key_dates.previewed_delivery).getTime(),
        new Date(b.key_dates.last_call).getTime()
      ));
      return nextDateA.getTime() - nextDateB.getTime();
    });
  }, []);

  const getTimeEntriesForProject = useCallback((projectId: string) => {
    return timeEntries.filter(entry => entry.project_id === projectId);
  }, [timeEntries]);

  const getTotalHoursForProject = useCallback((projectId: string) => {
    return timeEntries
      .filter(entry => entry.project_id === projectId)
      .reduce((total, entry) => total + entry.hours, 0);
  }, [timeEntries]);

  const addTimeEntry = useCallback(async (timeEntryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          project_id: timeEntryData.project_id,
          user_id: timeEntryData.user_id,
          user_name: timeEntryData.user_name,
          hours: timeEntryData.hours,
          date: timeEntryData.date,
          description: timeEntryData.description,
          task_category: timeEntryData.task_category,
          percentage_completed: timeEntryData.percentage_completed
        }])
        .select()
        .single();

      if (error) throw error;

      const newTimeEntry = dbRowToTimeEntry(data);
      setTimeEntries(prev => [newTimeEntry, ...prev]);
      
      // Update project's hours_completed
      const totalHours = getTotalHoursForProject(timeEntryData.project_id) + timeEntryData.hours;
      await updateProject(timeEntryData.project_id, { hours_completed: totalHours });
      
      return newTimeEntry;
    } catch (error) {
      console.error('Error adding time entry:', error);
      throw error;
    }
  }, [getTotalHoursForProject, updateProject]);

  const updateTimeEntry = useCallback(async (id: string, updates: Partial<TimeEntry>) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setTimeEntries(prev => prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updated_at: new Date().toISOString() }
          : entry
      ));
      
      // Recalculate project hours
      const updatedEntry = timeEntries.find(e => e.id === id);
      if (updatedEntry) {
        const totalHours = getTotalHoursForProject(updatedEntry.project_id);
        await updateProject(updatedEntry.project_id, { hours_completed: totalHours });
      }
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  }, [timeEntries, getTotalHoursForProject, updateProject]);

  const deleteTimeEntry = useCallback(async (id: string) => {
    try {
      const entryToDelete = timeEntries.find(e => e.id === id);
      if (!entryToDelete) return;

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTimeEntries(prev => prev.filter(entry => entry.id !== id));
      
      // Recalculate project hours
      const totalHours = getTotalHoursForProject(entryToDelete.project_id) - entryToDelete.hours;
      await updateProject(entryToDelete.project_id, { hours_completed: Math.max(0, totalHours) });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }, [timeEntries, getTotalHoursForProject, updateProject]);

  // Meeting functions
  const createMeeting = useCallback(async (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          project_id: meetingData.project_id,
          title: meetingData.title,
          date: meetingData.date,
          attendees: meetingData.attendees,
          notes: meetingData.notes,
          photos: meetingData.photos,
          voice_notes: meetingData.voice_notes,
          author_id: meetingData.author_id,
          author_name: meetingData.author_name
        }])
        .select()
        .single();

      if (error) throw error;

      const newMeeting = dbRowToMeeting(data);
      setMeetings(prev => [newMeeting, ...prev]);
      
      // Add meeting reference to project updates
      await addProjectUpdate(meetingData.project_id, `Meeting: ${meetingData.title}`, meetingData.author_id, meetingData.author_name);
      
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }, [addProjectUpdate]);

  const updateMeeting = useCallback(async (id: string, updates: Partial<Meeting>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setMeetings(prev => prev.map(m => 
        m.id === id 
          ? { ...m, ...updates, updated_at: new Date().toISOString() }
          : m
      ));
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      const meeting = meetings.find(m => m.id === id);
      if (!meeting) return;

      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMeetings(prev => prev.filter(m => m.id !== id));
      
      // Remove meeting reference from project updates
      await supabase
        .from('project_notes')
        .delete()
        .eq('meeting_id', id);

      setProjects(prev => prev.map(p => 
        p.id === meeting.project_id 
          ? { ...p, notes: p.notes.filter(note => note.meeting_id !== id) }
          : p
      ));
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }, [meetings]);

  return {
    projects,
    tasks,
    timeEntries,
    meetings,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    addProjectUpdate,
    deleteProject,
    getTasksForProject,
    updateProjectTasks,
    sortProjectsByNextDate,
    getTimeEntriesForProject,
    getTotalHoursForProject,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    createMeeting,
    updateMeeting,
    deleteMeeting
  };
};