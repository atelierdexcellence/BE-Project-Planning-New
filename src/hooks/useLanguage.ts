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
    'nav.overview': 'Team Overview',
    'nav.gantt': 'Annual Gantt',
    'nav.projects': 'Projects',
    'nav.analytics': 'Analytics',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    
    // Header
    'header.title': 'Bureau d\'Études',
    'header.subtitle': 'Project Management & Gantt',
    
    // Auth
    'auth.signIn': 'Sign in to your account',
    'auth.signin': 'Sign in to your account',
    'auth.email': 'Email address',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.signingIn': 'Signing in...',
    
    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Manage all Bureau d\'Études projects',
    'projects.new_project': 'New Project',
    'projects.search': 'Search projects...',
    'projects.no_projects': 'No projects yet.',
    'projects.no_search_results': 'No projects found matching your search.',
    
    // Project Form
    'project.edit': 'Edit Project',
    'project.new': 'New Project',
    'project.bc_order': 'Business Central Order Number',
    'project.lookup': 'Lookup',
    'project.order_found': '✓ Order found and data imported',
    'project.name': 'Project Name',
    'project.client': 'Client',
    'project.collection': 'Collection/Modèles',
    'project.composition': 'Composition',
    'project.date_brief': 'Date of Brief',
    'project.status': 'Status',
    'project.commercial': 'Commercial/Chargé d\'affaires',
    'project.atelier': 'Atelier',
    'project.be_team': 'BE Team Member',
    'project.key_dates': 'Key Dates & Deadlines',
    'project.start_be': 'Start in BE',
    'project.wood_foam': 'Wood/Foam Launch',
    'project.delivery': 'Previewed Delivery',
    'project.last_call': 'Last Call',
    'project.hours_previewed': 'Hours Previewed',
    'project.hours_completed': 'Hours Completed',
    'project.view_gantt': 'View Project Gantt',
    'project.cancel': 'Cancel',
    'project.create': 'Create Project',
    'project.update': 'Update Project',
    
    // Gantt
    'gantt.title': 'Annual Gantt Overview',
    'gantt.subtitle': 'Projects sorted by next key date',
    'gantt.project_column_title': 'Project',
    'gantt.export': 'Export',
    'gantt.week': 'Week',
    'gantt.year': 'Year',
    'gantt.quarter': 'Quarter',
    'gantt.month': 'Month',
    'gantt.all_status': 'All Status',
    'gantt.all_categories': 'All Categories',
    'gantt.back_overview': 'Back to Overview',
    'gantt.key_dates': 'Key Dates',
    'gantt.task_phase': 'Task / Phase',
    'gantt.no_tasks': 'No tasks defined for this project yet.',
    'gantt.tasks_appear': 'Tasks will appear here once they are created.',
    'gantt.manage_tasks': 'Manage Tasks',
    'gantt.today': 'Today',
    
    // Key Dates
    'gantt.wood_foam_launch': 'Wood/Foam Launch',
    'gantt.previewed_delivery': 'Previewed Delivery',
    'gantt.last_call': 'Last Call',
    
    // Task Categories
    'overview.title': 'Team Workload Overview',
    'overview.subtitle': 'BE Team workload and project distribution analysis',
    'overview.be_team_members': 'BE Team Members',
    'overview.active_projects': 'Active Projects',
    'overview.overdue_projects': 'Overdue Projects',
    'overview.avg_utilization': 'Avg. Utilization',
    'overview.capacity': 'Capacity',
    'overview.overdue': 'overdue',
    'overview.total_hours': 'Total Hours',
    'overview.completed': 'Completed',
    'overview.no_active_projects': 'No active projects',
    'overview.available_assignment': 'Available for new assignments',
    'overview.progress': 'Progress',
    'overview.next': 'Next',
    'overview.more_projects': 'more projects',
    
    'task.reunion_lancement': 'Réunion de lancement',
    'task.be_plans_validation': 'BE plans pour validation client',
    'task.be_conception_3d': 'BE conception 3D',
    'task.be_prepa_fichiers': 'BE prépa fichiers découpe et notice montage',
    'task.commande_mousse': 'Commande mousse',
    'task.reception_mousse': 'Réception mousse',
    'task.decoupe_bois_montage': 'Découpe bois et montage',
    'task.reception_structure_bois': 'Réception structure bois à Chennevières',
    'task.mise_en_mousse': 'Mise en mousse',
    'task.reception_tissu': 'Réception tissu',
    'task.confection': 'Confection (coupe et couture)',
    'task.tapisserie': 'Tapisserie',
    'task.rdv_confort_validation': 'RDV confort validation mise en blanc',
    'task.compte_rendu': 'Compte rendu',
    'task.modifs_bois_mousse': 'Modifs bois / mousse post RDV',
    'task.nomenclature_bc': 'Nomenclature mis sur BC',
    
    // Task Management
    'tasks.manage': 'Manage Project Tasks',
    'tasks.reorder': 'Drag to reorder tasks',
    'tasks.enabled_tasks': 'Enabled Tasks',
    'tasks.available_tasks': 'Available Tasks',
    'tasks.save': 'Save Tasks',
    'tasks.cancel': 'Cancel',
    
    // Status
    'status.planning': 'Planning',
    'status.in_progress': 'In Progress',
    'status.at_risk': 'At Risk',
    'status.overdue': 'Overdue',
    'status.completed': 'Completed',
    'status.on_hold': 'On Hold',
    'status.pending': 'Pending',
    'status.blocked': 'Blocked',
    
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
    'common.import': 'Import',
    'common.access_denied': 'Access Denied',
    'common.admin_required': 'You need administrator privileges to access user management.',
    
    // Users
    'users.title': 'Team Management',
    'users.subtitle': 'Manage team members, roles, and permissions',
    'users.users': 'users',
    'users.add_user': 'Add User',
    'users.search': 'Search users...',
    'users.all_roles': 'All Roles',
    'users.admin': 'Admin',
    'users.team_member': 'Team Member',
    'users.commercial': 'Commercial',
    'users.atelier': 'Atelier',
    'users.all_status': 'All Status',
    'users.active': 'Active',
    'users.inactive': 'Inactive',
    'users.pending': 'Pending',
    'users.user': 'User',
    'users.role': 'Role',
    'users.department': 'Department',
    'users.status': 'Status',
    'users.last_login': 'Last Login',
    'users.actions': 'Actions',
    'users.never': 'Never',
    'users.permissions': 'Permissions',
  },
  fr: {
    // Navigation
    'nav.overview': 'Vue d\'Équipe',
    'nav.gantt': 'Gantt Annuel',
    'nav.projects': 'Projets',
    'nav.analytics': 'Analyses',
    'nav.users': 'Utilisateurs',
    'nav.settings': 'Paramètres',
    
    // Header
    'header.title': 'Bureau d\'Études',
    'header.subtitle': 'Gestion de Projets & Gantt',
    
    // Auth
    'auth.signIn': 'Connectez-vous à votre compte',
    'auth.signin': 'Connectez-vous à votre compte',
    'auth.email': 'Adresse e-mail',
    'auth.emailPlaceholder': 'Entrez votre e-mail',
    'auth.password': 'Mot de passe',
    'auth.passwordPlaceholder': 'Entrez votre mot de passe',
    'auth.signingIn': 'Connexion...',
    
    // Projects
    'projects.title': 'Projets',
    'projects.subtitle': 'Gérer tous les projets du Bureau d\'Études',
    'projects.new_project': 'Nouveau Projet',
    'projects.search': 'Rechercher des projets...',
    'projects.no_projects': 'Aucun projet pour le moment.',
    'projects.no_search_results': 'Aucun projet trouvé correspondant à votre recherche.',
    
    // Project Form
    'project.edit': 'Modifier le Projet',
    'project.new': 'Nouveau Projet',
    'project.bc_order': 'Numéro de Commande Business Central',
    'project.lookup': 'Rechercher',
    'project.order_found': '✓ Commande trouvée et données importées',
    'project.name': 'Nom du Projet',
    'project.client': 'Client',
    'project.collection': 'Collection/Modèles',
    'project.composition': 'Composition',
    'project.date_brief': 'Date du Brief',
    'project.status': 'Statut',
    'project.commercial': 'Commercial/Chargé d\'affaires',
    'project.atelier': 'Atelier',
    'project.be_team': 'Membre Équipe BE',
    'project.key_dates': 'Dates Clés & Échéances',
    'project.start_be': 'Début en BE',
    'project.wood_foam': 'Lancement Bois/Mousse',
    'project.delivery': 'Livraison Prévue',
    'project.last_call': 'Dernier Appel',
    'project.hours_previewed': 'Heures Prévues',
    'project.hours_completed': 'Heures Réalisées',
    'project.view_gantt': 'Voir Gantt du Projet',
    'project.cancel': 'Annuler',
    'project.create': 'Créer le Projet',
    'project.update': 'Mettre à Jour le Projet',
    
    // Gantt
    'gantt.title': 'Vue d\'Ensemble Gantt Annuel',
    'gantt.subtitle': 'Projets triés par prochaine date clé',
    'gantt.project_column_title': 'Projet',
    'gantt.export': 'Exporter',
    'gantt.week': 'Semaine',
    'gantt.year': 'Année',
    'gantt.quarter': 'Trimestre',
    'gantt.month': 'Mois',
    'gantt.all_status': 'Tous les Statuts',
    'gantt.all_categories': 'Toutes les Catégories',
    'gantt.back_overview': 'Retour à la Vue d\'Ensemble',
    'gantt.key_dates': 'Dates Clés',
    'gantt.task_phase': 'Tâche / Phase',
    'gantt.no_tasks': 'Aucune tâche définie pour ce projet pour le moment.',
    'gantt.tasks_appear': 'Les tâches apparaîtront ici une fois créées.',
    'gantt.manage_tasks': 'Gérer les Tâches',
    'gantt.today': 'Aujourd\'hui',
    
    // Key Dates
    'gantt.wood_foam_launch': 'Lancement Bois/Mousse',
    'gantt.previewed_delivery': 'Livraison Prévue',
    'gantt.last_call': 'Dernier Appel',
    
    // Task Categories
    'overview.title': 'Vue d\'Ensemble de la Charge de Travail',
    'overview.subtitle': 'Analyse de la charge de travail et de la répartition des projets de l\'équipe BE',
    'overview.be_team_members': 'Membres de l\'Équipe BE',
    'overview.active_projects': 'Projets Actifs',
    'overview.overdue_projects': 'Projets en Retard',
    'overview.avg_utilization': 'Utilisation Moyenne',
    'overview.capacity': 'Capacité',
    'overview.overdue': 'en retard',
    'overview.total_hours': 'Heures Totales',
    'overview.completed': 'Terminé',
    'overview.no_active_projects': 'Aucun projet actif',
    'overview.available_assignment': 'Disponible pour de nouvelles affectations',
    'overview.progress': 'Progrès',
    'overview.next': 'Suivant',
    'overview.more_projects': 'projets supplémentaires',
    
    'task.reunion_lancement': 'Réunion de lancement',
    'task.be_plans_validation': 'BE plans pour validation client',
    'task.be_conception_3d': 'BE conception 3D',
    'task.be_prepa_fichiers': 'BE prépa fichiers découpe et notice montage',
    'task.commande_mousse': 'Commande mousse',
    'task.reception_mousse': 'Réception mousse',
    'task.decoupe_bois_montage': 'Découpe bois et montage',
    'task.reception_structure_bois': 'Réception structure bois à Chennevières',
    'task.mise_en_mousse': 'Mise en mousse',
    'task.reception_tissu': 'Réception tissu',
    'task.confection': 'Confection (coupe et couture)',
    'task.tapisserie': 'Tapisserie',
    'task.rdv_confort_validation': 'RDV confort validation mise en blanc',
    'task.compte_rendu': 'Compte rendu',
    'task.modifs_bois_mousse': 'Modifs bois / mousse post RDV',
    'task.nomenclature_bc': 'Nomenclature mis sur BC',
    
    // Task Management
    'tasks.manage': 'Gérer les Tâches du Projet',
    'tasks.reorder': 'Glisser pour réorganiser les tâches',
    'tasks.enabled_tasks': 'Tâches Activées',
    'tasks.available_tasks': 'Tâches Disponibles',
    'tasks.save': 'Enregistrer les Tâches',
    'tasks.cancel': 'Annuler',
    
    // Status
    'status.planning': 'Planification',
    'status.in_progress': 'En Cours',
    'status.at_risk': 'À Risque',
    'status.overdue': 'En Retard',
    'status.completed': 'Terminé',
    'status.on_hold': 'En Attente',
    'status.pending': 'En Attente',
    'status.blocked': 'Bloqué',
    
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
    'common.import': 'Importer',
    'common.access_denied': 'Accès Refusé',
    'common.admin_required': 'Vous avez besoin de privilèges administrateur pour accéder à la gestion des utilisateurs.',
    
    // Users
    'users.title': 'Gestion d\'Équipe',
    'users.subtitle': 'Gérer les membres de l\'équipe, les rôles et les permissions',
    'users.users': 'utilisateurs',
    'users.add_user': 'Ajouter Utilisateur',
    'users.search': 'Rechercher des utilisateurs...',
    'users.all_roles': 'Tous les Rôles',
    'users.admin': 'Administrateur',
    'users.team_member': 'Membre d\'Équipe',
    'users.commercial': 'Commercial',
    'users.atelier': 'Atelier',
    'users.all_status': 'Tous les Statuts',
    'users.active': 'Actif',
    'users.inactive': 'Inactif',
    'users.pending': 'En Attente',
    'users.user': 'Utilisateur',
    'users.role': 'Rôle',
    'users.department': 'Département',
    'users.status': 'Statut',
    'users.last_login': 'Dernière Connexion',
    'users.actions': 'Actions',
    'users.never': 'Jamais',
    'users.permissions': 'Permissions',
  }
};

export const useLanguageHook = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language from localStorage or default to 'fr'
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { language, setLanguage, t };
};