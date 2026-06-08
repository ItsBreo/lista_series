import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { WatchItem, WatchItemFormData } from './types';

const COLLECTION_NAME = 'watchlist';

export function subscribeToWatchlist(
  callback: (items: WatchItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: WatchItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WatchItem[];
      callback(items);
    },
    (error) => {
      console.error('Error listening to watchlist:', error);
      onError?.(error);
    }
  );
}

export async function addItem(data: WatchItemFormData): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateItem(
  id: string,
  data: Partial<WatchItemFormData>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteItem(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function updateProgress(
  id: string,
  season: number,
  episode: number
): Promise<void> {
  await updateItem(id, {
    currentSeason: season,
    currentEpisode: episode,
    status: 'watching',
  });
}

export async function updateMovieProgress(
  id: string,
  minute: number
): Promise<void> {
  await updateItem(id, {
    currentMinute: minute,
    status: 'watching',
  });
}

export async function markAsCompleted(
  id: string,
  rating?: number
): Promise<void> {
  await updateItem(id, {
    status: 'completed',
    ...(rating !== undefined ? { rating } : {}),
  });
}
