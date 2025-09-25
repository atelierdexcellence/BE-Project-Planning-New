import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Users, Camera, Mic, FileText, Eye, CreditCard as Edit, Trash2, MessageSquare } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { MeetingForm } from '../components/Meetings/MeetingForm';
import { MeetingView } from '../components/Meetings/MeetingView';
import type { Meeting, Project } from '../types';

export const MeetingsView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, meetings, createMeeting, updateMeeting, deleteMeeting } = useProjects();
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showMeetingView, setShowMeetingView] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           meeting.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || meeting.project_id === projectFilter;
      
      return matchesSearch && matchesProject;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, searchTerm, projectFilter]);

  const handleCreateMeeting = () => {
    setSelectedMeeting(null);
    setShowMeetingForm(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingForm(true);
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingView(true);
  };

  const handleSaveMeeting = async (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedMeeting) {
      await updateMeeting(selectedMeeting.id, meetingData);
    } else {
      await createMeeting(meetingData);
    }
    setShowMeetingForm(false);
    setSelectedMeeting(null);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm(t('meetings.confirm_delete'))) {
      await deleteMeeting(meetingId);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.name} - ${project.client}` : 'Unknown Project';
  };

  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Please log in to access meetings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-blue-600" />
            {t('meetings.title')}
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {t('meetings.subtitle')} • {filteredMeetings.length} meetings
          </p>
        </div>
        
        <button
          onClick={handleCreateMeeting}
          className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('meetings.new_meeting')}</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('meetings.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        >
          <option value="all">{t('meetings.all_projects')}</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name} - {project.client}
            </option>
          ))}
        </select>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm md:text-base">{t('meetings.no_meetings')}</p>
            <p className="text-xs md:text-sm mt-1">{t('meetings.create_first')}</p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                        {meeting.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-2">
                        {getProjectName(meeting.project_id)}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{new Date(meeting.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{meeting.attendees.length} attendees</span>
                        </div>
                        {meeting.photos.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Camera className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{meeting.photos.length} photos</span>
                          </div>
                        )}
                        {meeting.voice_notes.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Mic className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{meeting.voice_notes.length} voice notes</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-700 line-clamp-2">
                        {meeting.notes.substring(0, 150)}
                        {meeting.notes.length > 150 && '...'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewMeeting(meeting)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    title={t('meetings.view')}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {(meeting.author_id === user.id || user.role === 'admin') && (
                    <>
                      <button
                        onClick={() => handleEditMeeting(meeting)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                        title={t('meetings.edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title={t('meetings.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showMeetingForm && (
        <MeetingForm
          meeting={selectedMeeting}
          projects={projects}
          onSave={handleSaveMeeting}
          onCancel={() => {
            setShowMeetingForm(false);
            setSelectedMeeting(null);
          }}
        />
      )}

      {showMeetingView && selectedMeeting && (
        <MeetingView
          meeting={selectedMeeting}
          project={projects.find(p => p.id === selectedMeeting.project_id)}
          onEdit={() => {
            setShowMeetingView(false);
            handleEditMeeting(selectedMeeting);
          }}
          onClose={() => {
            setShowMeetingView(false);
            setSelectedMeeting(null);
          }}
        />
      )}
    </div>
  );
};