import { useState, createContext, useContext } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    'nav.meetings': 'Meetings',
    'nav.projects': 'Projects',
    'nav.team': 'Team',
    
    // Meetings
    'meetings.title': 'Project Meetings',
    'meetings.subtitle': 'Manage and track project meetings with photos and voice notes',
    'meetings.new_meeting': 'New Meeting',
    'meetings.search': 'Search meetings...',
    'meetings.all_projects': 'All Projects',
    'meetings.no_meetings': 'No meetings yet',
    'meetings.create_first': 'Create your first meeting to get started',
    'meetings.view': 'View',
    'meetings.edit': 'Edit',
    'meetings.delete': 'Delete',
    'meetings.confirm_delete': 'Are you sure you want to delete this meeting?',
    'meetings.edit_meeting': 'Edit Meeting',
    'meetings.project': 'Project',
    'meetings.select_project': 'Select a project',
    'meetings.date': 'Date',
    'meetings.title_placeholder': 'Enter meeting title',
    'meetings.attendees': 'Attendees',
    'meetings.people': 'people',
    'meetings.photos': 'Photos',
    'meetings.upload_photos': 'Upload Photos',
    'meetings.photo_caption': 'Photo caption...',
    'meetings.remove_photo': 'Remove Photo',
    'meetings.notes': 'Meeting Notes',
    'meetings.notes_placeholder': 'Enter meeting notes...',
    'meetings.voice_notes': 'Voice Notes',
    'meetings.start_voice': 'Start Voice-to-Text',
    'meetings.stop_voice': 'Stop Voice-to-Text',
    'meetings.record_audio': 'Record Audio',
    'meetings.recording': 'Recording',
    'meetings.voice_note': 'Voice Note',
    'meetings.no_notes': 'No notes added',
    'meetings.created_by': 'Created by',
    'meetings.update': 'Update Meeting',
    'meetings.create': 'Create Meeting',
    
    // Photo Editor
    'photo.edit_annotate': 'Edit & Annotate Photo',
    'photo.download': 'Download',
    'photo.save': 'Save Photo',
    'photo.drawing_tools': 'Drawing Tools',
    'photo.pen': 'Pen',
    'photo.eraser': 'Eraser',
    'photo.text': 'Text',
    'photo.shapes': 'Shapes',
    'photo.rectangle': 'Rectangle',
    'photo.circle': 'Circle',
    'photo.arrow': 'Arrow',
    'photo.colors': 'Colors',
    'photo.brush_size': 'Brush Size',
    'photo.text_size': 'Text Size',
    'photo.clear_all': 'Clear All',
    'photo.caption': 'Caption',
    'photo.caption_placeholder': 'Add a caption for this photo...',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import'
  },
  fr: {
    // Navigation
    'nav.meetings': 'Réunions',
    'nav.projects': 'Projets',
    'nav.team': 'Équipe',
    
    // Meetings
    'meetings.title': 'Réunions de Projet',
    'meetings.subtitle': 'Gérer et suivre les réunions de projet avec photos et notes vocales',
    'meetings.new_meeting': 'Nouvelle Réunion',
    'meetings.search': 'Rechercher des réunions...',
    'meetings.all_projects': 'Tous les Projets',
    'meetings.no_meetings': 'Aucune réunion pour le moment',
    'meetings.create_first': 'Créez votre première réunion pour commencer',
    'meetings.view': 'Voir',
    'meetings.edit': 'Modifier',
    'meetings.delete': 'Supprimer',
    'meetings.confirm_delete': 'Êtes-vous sûr de vouloir supprimer cette réunion ?',
    'meetings.edit_meeting': 'Modifier la Réunion',
    'meetings.project': 'Projet',
    'meetings.select_project': 'Sélectionner un projet',
    'meetings.date': 'Date',
    'meetings.title_placeholder': 'Entrez le titre de la réunion',
    'meetings.attendees': 'Participants',
    'meetings.people': 'personnes',
    'meetings.photos': 'Photos',
    'meetings.upload_photos': 'Télécharger Photos',
    'meetings.photo_caption': 'Légende de la photo...',
    'meetings.remove_photo': 'Supprimer Photo',
    'meetings.notes': 'Notes de Réunion',
    'meetings.notes_placeholder': 'Entrez les notes de réunion...',
    'meetings.voice_notes': 'Notes Vocales',
    'meetings.start_voice': 'Démarrer Voix-vers-Texte',
    'meetings.stop_voice': 'Arrêter Voix-vers-Texte',
    'meetings.record_audio': 'Enregistrer Audio',
    'meetings.recording': 'Enregistrement',
    'meetings.voice_note': 'Note Vocale',
    'meetings.no_notes': 'Aucune note ajoutée',
    'meetings.created_by': 'Créé par',
    'meetings.update': 'Mettre à Jour la Réunion',
    'meetings.create': 'Créer la Réunion',
    
    // Photo Editor
    'photo.edit_annotate': 'Modifier et Annoter la Photo',
    'photo.download': 'Télécharger',
    'photo.save': 'Enregistrer Photo',
    'photo.drawing_tools': 'Outils de Dessin',
    'photo.pen': 'Stylo',
    'photo.eraser': 'Gomme',
    'photo.text': 'Texte',
    'photo.shapes': 'Formes',
    'photo.rectangle': 'Rectangle',
    'photo.circle': 'Cercle',
    'photo.arrow': 'Flèche',
    'photo.colors': 'Couleurs',
    'photo.brush_size': 'Taille du Pinceau',
    'photo.text_size': 'Taille du Texte',
    'photo.clear_all': 'Tout Effacer',
    'photo.caption': 'Légende',
    'photo.caption_placeholder': 'Ajoutez une légende pour cette photo...',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer'
  }
};

export const useLanguageHook = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('meetings_language');
    return (saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('meetings_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { language, setLanguage, t };
};