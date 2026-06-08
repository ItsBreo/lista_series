import { Genre, ItemStatus, ItemType } from './types';

export type Locale = 'es' | 'en';

interface Translations {
  // App
  appTitle: string;
  appSubtitle: string;

  // Actions
  add: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  close: string;
  confirm: string;

  // Form
  title: string;
  type: string;
  genre: string;
  imageUrl: string;
  imageUrlPlaceholder: string;
  notes: string;
  notesPlaceholder: string;
  addedBy: string;
  addedByPlaceholder: string;
  rating: string;
  totalSeasons: string;
  currentSeason: string;
  currentEpisode: string;
  totalMinutes: string;
  currentMinute: string;
  status: string;
  addNew: string;
  editItem: string;
  titlePlaceholder: string;

  // Types
  series: string;
  movie: string;

  // Statuses
  watching: string;
  completed: string;
  pending: string;

  // Genres
  genres: Record<Genre, string>;

  // Filters
  all: string;
  filterByStatus: string;
  filterByGenre: string;
  allGenres: string;
  allStatuses: string;

  // Card
  season: string;
  episode: string;
  seasonShort: string;
  episodeShort: string;
  min: string;
  of: string;
  progress: string;
  markCompleted: string;
  confirmDelete: string;
  confirmDeleteMessage: string;

  // Empty state
  emptyTitle: string;
  emptyMessage: string;
  emptyAction: string;

  // Stats
  totalItems: string;
  watchingCount: string;
  completedCount: string;
  pendingCount: string;
}

const es: Translations = {
  appTitle: 'WatchList',
  appSubtitle: 'Nuestras series y películas',

  add: 'Añadir',
  edit: 'Editar',
  delete: 'Eliminar',
  save: 'Guardar',
  cancel: 'Cancelar',
  close: 'Cerrar',
  confirm: 'Confirmar',

  title: 'Título',
  type: 'Tipo',
  genre: 'Género',
  imageUrl: 'URL de imagen',
  imageUrlPlaceholder: 'https://image.tmdb.org/...',
  notes: 'Notas',
  notesPlaceholder: 'Notas sobre la serie o película...',
  addedBy: 'Añadido por',
  addedByPlaceholder: 'Tu nombre',
  rating: 'Puntuación',
  totalSeasons: 'Total de temporadas',
  currentSeason: 'Temporada actual',
  currentEpisode: 'Episodio actual',
  totalMinutes: 'Duración (minutos)',
  currentMinute: 'Minuto actual',
  status: 'Estado',
  addNew: 'Añadir nuevo',
  editItem: 'Editar',
  titlePlaceholder: 'Ej: Breaking Bad',

  series: 'Serie',
  movie: 'Película',

  watching: 'Viendo',
  completed: 'Completada',
  pending: 'Pendiente',

  genres: {
    action: 'Acción',
    comedy: 'Comedia',
    drama: 'Drama',
    horror: 'Terror',
    thriller: 'Thriller',
    romance: 'Romance',
    'sci-fi': 'Ciencia Ficción',
    fantasy: 'Fantasía',
    documentary: 'Documental',
    animation: 'Animación',
    crime: 'Crimen',
    mystery: 'Misterio',
  },

  all: 'Todas',
  filterByStatus: 'Filtrar por estado',
  filterByGenre: 'Filtrar por género',
  allGenres: 'Todos los géneros',
  allStatuses: 'Todos los estados',

  season: 'Temporada',
  episode: 'Episodio',
  seasonShort: 'T',
  episodeShort: 'Ep',
  min: 'min',
  of: 'de',
  progress: 'Progreso',
  markCompleted: 'Marcar como completada',
  confirmDelete: 'Confirmar eliminación',
  confirmDeleteMessage: '¿Estás seguro de que quieres eliminar',

  emptyTitle: 'La lista está vacía',
  emptyMessage: 'Añade tu primera serie o película para empezar a hacer seguimiento juntos.',
  emptyAction: 'Añadir la primera',

  totalItems: 'Total',
  watchingCount: 'Viendo',
  completedCount: 'Completadas',
  pendingCount: 'Pendientes',
};

const en: Translations = {
  appTitle: 'WatchList',
  appSubtitle: 'Our series & movies',

  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  confirm: 'Confirm',

  title: 'Title',
  type: 'Type',
  genre: 'Genre',
  imageUrl: 'Image URL',
  imageUrlPlaceholder: 'https://image.tmdb.org/...',
  notes: 'Notes',
  notesPlaceholder: 'Notes about the series or movie...',
  addedBy: 'Added by',
  addedByPlaceholder: 'Your name',
  rating: 'Rating',
  totalSeasons: 'Total seasons',
  currentSeason: 'Current season',
  currentEpisode: 'Current episode',
  totalMinutes: 'Duration (minutes)',
  currentMinute: 'Current minute',
  status: 'Status',
  addNew: 'Add new',
  editItem: 'Edit',
  titlePlaceholder: 'E.g. Breaking Bad',

  series: 'Series',
  movie: 'Movie',

  watching: 'Watching',
  completed: 'Completed',
  pending: 'Pending',

  genres: {
    action: 'Action',
    comedy: 'Comedy',
    drama: 'Drama',
    horror: 'Horror',
    thriller: 'Thriller',
    romance: 'Romance',
    'sci-fi': 'Sci-Fi',
    fantasy: 'Fantasy',
    documentary: 'Documentary',
    animation: 'Animation',
    crime: 'Crime',
    mystery: 'Mystery',
  },

  all: 'All',
  filterByStatus: 'Filter by status',
  filterByGenre: 'Filter by genre',
  allGenres: 'All genres',
  allStatuses: 'All statuses',

  season: 'Season',
  episode: 'Episode',
  seasonShort: 'S',
  episodeShort: 'Ep',
  min: 'min',
  of: 'of',
  progress: 'Progress',
  markCompleted: 'Mark as completed',
  confirmDelete: 'Confirm deletion',
  confirmDeleteMessage: 'Are you sure you want to delete',

  emptyTitle: 'The list is empty',
  emptyMessage: 'Add your first series or movie to start tracking together.',
  emptyAction: 'Add the first one',

  totalItems: 'Total',
  watchingCount: 'Watching',
  completedCount: 'Completed',
  pendingCount: 'Pending',
};

const translations: Record<Locale, Translations> = { es, en };

export function t(locale: Locale): Translations {
  return translations[locale];
}

export function getGenreLabel(genre: Genre, locale: Locale): string {
  return translations[locale].genres[genre];
}

export function getStatusLabel(status: ItemStatus, locale: Locale): string {
  const labels: Record<ItemStatus, string> = {
    watching: translations[locale].watching,
    completed: translations[locale].completed,
    pending: translations[locale].pending,
  };
  return labels[status];
}

export function getTypeLabel(type: ItemType, locale: Locale): string {
  const labels: Record<ItemType, string> = {
    series: translations[locale].series,
    movie: translations[locale].movie,
  };
  return labels[type];
}

export const GENRES: Genre[] = [
  'action',
  'comedy',
  'drama',
  'horror',
  'thriller',
  'romance',
  'sci-fi',
  'fantasy',
  'documentary',
  'animation',
  'crime',
  'mystery',
];

export const STATUSES: ItemStatus[] = ['watching', 'completed', 'pending'];
export const TYPES: ItemType[] = ['series', 'movie'];
