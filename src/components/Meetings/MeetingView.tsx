import React, { useState } from 'react';
import { X, Calendar, Users, Camera, Mic, CreditCard as Edit, FileText, ZoomIn } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import type { Meeting, Project } from '../../types';
import { BE_TEAM_MEMBERS, COMMERCIAL_USERS } from '../../types';

interface MeetingViewProps {
  meeting: Meeting;
  project?: Project;
  onEdit: () => void;
  onClose: () => void;
}

export const MeetingView: React.FC<MeetingViewProps> = ({
  meeting,
  project,
  onEdit,
  onClose
}) => {
  const { t } = useLanguage();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const getUserName = (userId: string) => {
    const allUsers = [...BE_TEAM_MEMBERS, ...COMMERCIAL_USERS];
    const user = allUsers.find(u => u.id === userId);
    return user?.name || userId;
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{meeting.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {project ? `${project.name} - ${project.client}` : 'Unknown Project'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>{t('meetings.edit')}</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Meeting Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('meetings.date')}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(meeting.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('meetings.attendees')}</p>
                  <p className="text-sm text-gray-600">
                    {meeting.attendees.length} {t('meetings.people')}
                  </p>
                </div>
              </div>
            </div>

            {/* Attendees List */}
            {meeting.attendees.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('meetings.attendees')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {meeting.attendees.map(attendeeId => (
                    <div key={attendeeId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {getUserName(attendeeId).split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{getUserName(attendeeId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {meeting.photos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>{t('meetings.photos')} ({meeting.photos.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meeting.photos.map(photo => (
                    <div key={photo.id} className="space-y-2 group">
                      <div className="relative">
                        <img
                          src={photo.url}
                          alt="Meeting photo"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedPhoto(photo.url)}
                        />
                        <button
                          onClick={() => setSelectedPhoto(photo.url)}
                          className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="View full size"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                      </div>
                      {photo.caption && (
                        <p className="text-sm text-gray-600 px-1">{photo.caption}</p>
                      )}
                      <p className="text-xs text-gray-400 px-1">
                        {new Date(photo.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Notes */}
            {meeting.voice_notes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>{t('meetings.voice_notes')} ({meeting.voice_notes.length})</span>
                </h3>
                <div className="space-y-3">
                  {meeting.voice_notes.map(note => (
                    <div key={note.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mic className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t('meetings.voice_note')} - {formatRecordingTime(note.duration)}
                          </p>
                          {note.transcript && (
                            <p className="text-sm text-gray-600 mt-1">{note.transcript}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Notes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{t('meetings.notes')}</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {meeting.notes ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{meeting.notes}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('meetings.no_notes')}</p>
                )}
              </div>
            </div>

            {/* Meeting Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t('meetings.created_by')} {meeting.author_name}</span>
                <span>{new Date(meeting.created_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedPhoto}
              alt="Full size photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};