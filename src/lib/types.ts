import { Timestamp } from 'firebase/firestore';

export type ItemType = 'series' | 'movie';

export type ItemStatus = 'watching' | 'completed' | 'pending';

export type Genre =
  | 'action'
  | 'comedy'
  | 'drama'
  | 'horror'
  | 'thriller'
  | 'romance'
  | 'sci-fi'
  | 'fantasy'
  | 'documentary'
  | 'animation'
  | 'crime'
  | 'mystery';

export interface WatchItem {
  id: string;
  title: string;
  type: ItemType;
  genre: Genre;
  imageUrl?: string;

  // Series only
  totalSeasons?: number;
  currentSeason?: number;
  currentEpisode?: number;

  // Movies only
  currentMinute?: number;
  totalMinutes?: number;

  // Common
  status: ItemStatus;
  notes?: string;
  rating?: number; // 1-5
  addedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type WatchItemFormData = Omit<WatchItem, 'id' | 'createdAt' | 'updatedAt'>;
