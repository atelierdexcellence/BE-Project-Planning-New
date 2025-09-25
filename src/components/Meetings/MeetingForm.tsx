import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Camera, Mic, MicOff, Users, Calendar, FileText, Upload, Trash2, Play, Pause, Square, CreditCard as Edit, Video, Camera as CameraIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage, Language } from '../../hooks/useLanguage';
import { PhotoEditor } from './PhotoEditor';
import { CameraCapture } from './CameraCapture';
import type { Meeting, Project, MeetingPhoto, VoiceNote } from '../../types';
import { BE_TEAM_MEMBERS, COMMERCIAL_USERS } from '../../types';

interface MeetingFormProps {
  meeting?: Meeting | null;
  projects: Project[];
  onSave: (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
  meeting,
  projects,
  onSave,
  onCancel
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    attendees: [] as string[],
    notes: '',
    photos: [] as MeetingPhoto[],
    voice_notes: [] as VoiceNote[]
  });

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordingInterval = useRef<NodeJS.Timeout>();
  
  // Voice-to-text state
  const [voiceEntries, setVoiceEntries] = useState<string[]>([]);
  
  // Photo editing state
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{ id: string; url: string; caption?: string } | null>(null);
  
  // Camera capture state
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');

  // Speech recognition
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const isStoppingIntentionally = useRef(false);
  const lastProcessedTranscript = useRef<string>('');
  const lastResultIndex = useRef<number>(0);

  useEffect(() => {
    if (meeting) {
      setFormData({
        project_id: meeting.project_id,
        title: meeting.title,
        date: meeting.date,
        attendees: meeting.attendees,
        notes: meeting.notes,
        photos: meeting.photos,
        voice_notes: meeting.voice_notes
      });
    }
  }, [meeting]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'en' ? 'en-US' : 'fr-FR';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = Math.max(event.resultIndex, lastResultIndex.current); i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        lastResultIndex.current = event.results.length;
        
        if (finalTranscript.trim()) {
          const trimmedTranscript = finalTranscript.trim();
          if (trimmedTranscript && trimmedTranscript !== lastProcessedTranscript.current) {
            lastProcessedTranscript.current = trimmedTranscript;
            handleVoiceTranscript(trimmedTranscript);
          }
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognitionInstance.onstart = () => {
        isStoppingIntentionally.current = false;
        lastResultIndex.current = 0;
        lastProcessedTranscript.current = '';
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        
        if (!isStoppingIntentionally.current && isListening) {
          setTimeout(() => {
            if (!isStoppingIntentionally.current) {
              try {
                recognitionInstance.start();
              } catch (error) {
                console.error('Failed to restart speech recognition:', error);
              }
            }
          }, 1000);
        }
        
        isStoppingIntentionally.current = false;
      };

      setRecognition(recognitionInstance);
      
      return () => {
        if (recognitionInstance) {
          isStoppingIntentionally.current = true;
          try {
            recognitionInstance.stop();
          } catch (error) {
            console.error('Error stopping recognition during cleanup:', error);
          }
        }
      };
    }
  }, [language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttendeeToggle = (attendeeId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(attendeeId)
        ? prev.attendees.filter(id => id !== attendeeId)
        : [...prev.attendees, attendeeId]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setEditingPhoto({
            id: Date.now().toString() + Math.random(),
            url: event.target?.result as string,
            caption: ''
          });
          setShowPhotoEditor(true);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleVoiceTranscript = (transcript: string) => {
    const voiceCommandFr = 'nouveau note';
    const voiceCommandEn = 'new note';
    const voiceCommand = language === 'en' ? voiceCommandEn : voiceCommandFr;
    const altCommand = language === 'en' ? voiceCommandFr : voiceCommandEn;
    const parts = transcript.toLowerCase().split(voiceCommand);
    const altParts = transcript.toLowerCase().split(altCommand);
    
    const finalParts = parts.length > 1 ? parts : altParts;
    
    if (finalParts.length > 1) {
      const newEntries = finalParts
        .map(part => part.trim())
        .filter(part => part.length > 0);
      
      setVoiceEntries(prev => [...prev, ...newEntries]);
    } else {
      const newEntry = transcript.trim();
      if (newEntry.length > 0) {
        setVoiceEntries(prev => [...prev, newEntry]);
      }
    }
  };

  React.useEffect(() => {
    if (voiceEntries.length > 0) {
      const currentNotes = formData.notes;
      const voiceSection = voiceEntries.map(entry => `• ${entry}`).join('\n\n');
      
      setFormData(prev => ({
        ...prev,
        notes: currentNotes
          ? `${currentNotes}\n\n\n${voiceSection}`
          : voiceSection
      }));
    }
  }, [voiceEntries]);

  const clearVoiceEntries = () => {
    setVoiceEntries([]);
    lastResultIndex.current = 0;
    lastProcessedTranscript.current = '';
    const notesWithoutVoice = formData.notes.split('\n\n').filter(section => 
      !section.startsWith('• ')
    ).join('\n\n');
    setFormData(prev => ({ ...prev, notes: notesWithoutVoice }));
  };

  const handleEditPhoto = (photo: MeetingPhoto) => {
    setEditingPhoto({
      id: photo.id,
      url: photo.url,
      caption: photo.caption || ''
    });
    setShowPhotoEditor(true);
  };

  const handlePhotoSave = (editedImageUrl: string, caption: string) => {
    if (!editingPhoto) return;
    
    const isNewPhoto = !formData.photos.find(p => p.id === editingPhoto.id);
    
    if (isNewPhoto) {
      const newPhoto: MeetingPhoto = {
        id: editingPhoto.id,
        url: editedImageUrl,
        caption: caption,
        timestamp: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.map(photo =>
          photo.id === editingPhoto.id 
            ? { ...photo, url: editedImageUrl, caption: caption }
            : photo
        )
      }));
    }
    
    setShowPhotoEditor(false);
    setEditingPhoto(null);
  };

  const handlePhotoCancel = () => {
    setShowPhotoEditor(false);
    setEditingPhoto(null);
  };

  const handleCameraCapture = (mediaUrl: string, type: 'photo' | 'video') => {
    if (type === 'photo') {
      setEditingPhoto({
        id: Date.now().toString() + Math.random(),
        url: mediaUrl,
        caption: ''
      });
      setShowPhotoEditor(true);
    } else {
      const newPhoto: MeetingPhoto = {
        id: Date.now().toString() + Math.random(),
        url: mediaUrl,
        caption: '',
        timestamp: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto]
      }));
    }
    setShowCameraCapture(false);
  };

  const handleCameraCancel = () => {
    setShowCameraCapture(false);
  };

  const handlePhotoCaption = (photoId: string, caption: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map(photo =>
        photo.id === photoId ? { ...photo, caption } : photo
      )
    }));
  };

  const handleRemovePhoto = (photoId: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const startVoiceToText = () => {
    if (recognition && !isListening) {
      try {
        recognition.lang = language === 'en' ? 'en-US' : 'fr-FR';
        lastResultIndex.current = 0;
        lastProcessedTranscript.current = '';
        recognition.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  };

  const stopVoiceToText = () => {
    if (recognition && isListening) {
      try {
        isStoppingIntentionally.current = true;
        lastResultIndex.current = 0;
        lastProcessedTranscript.current = '';
        recognition.stop();
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newVoiceNote: VoiceNote = {
          id: Date.now().toString(),
          transcript: '',
          duration: recordingTime,
          timestamp: new Date().toISOString()
        };

        setFormData(prev => ({
          ...prev,
          voice_notes: [...prev.voice_notes, newVoiceNote]
        }));

        setAudioChunks([]);
        setRecordingTime(0);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const meetingData = {
      ...formData,
      author_id: user.id,
      author_name: user.name
    };

    onSave(meetingData);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allUsers = [...BE_TEAM_MEMBERS, ...COMMERCIAL_USERS];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {meeting ? t('meetings.edit_meeting') : t('meetings.new_meeting')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meetings.project')} *
                </label>
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('meetings.select_project')}</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meetings.date')} *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('meetings.title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('meetings.title_placeholder')}
              />
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meetings.attendees')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                {allUsers.map(user => (
                  <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.attendees.includes(user.id)}
                      onChange={() => handleAttendeeToggle(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meetings.photos')}
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>{t('meetings.upload_photos')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureMode('photo');
                        setShowCameraCapture(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Take Photo</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureMode('video');
                        setShowCameraCapture(true);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Video className="h-4 w-4" />
                      <span>Record Video</span>
                    </button>
                  </div>
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.photos.map(photo => (
                      <div key={photo.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="relative group">
                          {photo.url.startsWith('data:video/') ? (
                            <video
                              src={photo.url}
                              controls
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                          ) : (
                            <img
                              src={photo.url}
                              alt="Meeting photo"
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => !photo.url.startsWith('data:video/') && handleEditPhoto(photo)}
                            className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title={photo.url.startsWith('data:video/') ? "Video cannot be edited" : "Edit photo"}
                            disabled={photo.url.startsWith('data:video/')}
                          >
                            {photo.url.startsWith('data:video/') ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <Edit className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={photo.url.startsWith('data:video/') ? "Video caption..." : t('meetings.photo_caption')}
                          value={photo.caption || ''}
                          onChange={(e) => handlePhotoCaption(photo.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>{photo.url.startsWith('data:video/') ? "Remove Video" : t('meetings.remove_photo')}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes with Voice-to-Text */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                {t('meetings.notes')}
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {!recognition && (
                    <div className="text-sm text-yellow-600 mb-2">
                      ⚠️ Speech recognition not supported in this browser. Try Chrome or Edge.
                    </div>
                  )}
                  {recognition && (
                    <div className="text-sm text-blue-600 mb-2 flex flex-col space-y-1">
                      <div>
                        💡 Say "{language === 'en' ? 'New Note' : 'Nouveau Note'}" to create separate bullet points
                      </div>
                      <div className="text-xs">
                        🌐 Voice recognition: {language === 'en' ? 'English' : 'Français'}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceToText : startVoiceToText}
                    disabled={!recognition}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isListening
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : recognition 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    } ${!recognition ? 'opacity-50' : ''}`}
                  >
                    <Mic className="h-4 w-4" />
                    <span>
                      {isListening ? t('meetings.stop_voice') : t('meetings.start_voice')}
                      {isListening && ' (Listening...)'}
                    </span>
                  </button>
                  
                  {voiceEntries.length > 0 && (
                    <button
                      type="button"
                      onClick={clearVoiceEntries}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear Voice Entries ({voiceEntries.length})</span>
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isRecording
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span>
                      {isRecording 
                        ? `${t('meetings.recording')} ${formatRecordingTime(recordingTime)}`
                        : t('meetings.record_audio')
                      }
                    </span>
                  </button>
                </div>
                
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('meetings.notes_placeholder')}
                />
              </div>
            </div>

            {/* Voice Notes Display */}
            {formData.voice_notes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meetings.voice_notes')} ({formData.voice_notes.length})
                </label>
                <div className="space-y-2">
                  {formData.voice_notes.map(note => (
                    <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Mic className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {t('meetings.voice_note')} - {formatRecordingTime(note.duration)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {meeting ? t('meetings.update') : t('meetings.create')}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Editor Modal */}
      {showPhotoEditor && editingPhoto && (
        <PhotoEditor
          imageUrl={editingPhoto.url}
          caption={editingPhoto.caption}
          onSave={handlePhotoSave}
          onCancel={handlePhotoCancel}
        />
      )}

      {/* Camera Capture Modal */}
      {showCameraCapture && (
        <CameraCapture
          mode={captureMode}
          onCapture={handleCameraCapture}
          onCancel={handleCameraCancel}
        />
      )}
    </div>
  );
};