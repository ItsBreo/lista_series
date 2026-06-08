import { Genre, ItemType } from './types';
import { Locale } from './i18n';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Maps TMDB genre ids (movie + tv) to our internal Genre union.
const GENRE_MAP: Record<number, Genre> = {
  28: 'action',
  12: 'action', // Adventure
  10759: 'action', // Action & Adventure (TV)
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  14: 'fantasy',
  27: 'horror',
  9648: 'mystery',
  10749: 'romance',
  878: 'sci-fi',
  10765: 'sci-fi', // Sci-Fi & Fantasy (TV)
  53: 'thriller',
};

function mapGenre(genreIds: number[] | undefined): Genre {
  if (genreIds) {
    for (const id of genreIds) {
      if (GENRE_MAP[id]) return GENRE_MAP[id];
    }
  }
  return 'drama';
}

function lang(locale: Locale): string {
  return locale === 'es' ? 'es-ES' : 'en-US';
}

export interface TmdbResult {
  tmdbId: number;
  type: ItemType;
  title: string;
  year: string;
  posterUrl?: string;
  genre: Genre;
  overview: string;
}

export interface TmdbDetails extends TmdbResult {
  totalSeasons?: number; // series
  totalMinutes?: number; // movie
}

interface TmdbApiItem {
  id: number;
  media_type?: string;
  title?: string; // movies
  name?: string; // tv
  release_date?: string; // movies
  first_air_date?: string; // tv
  poster_path?: string | null;
  genre_ids?: number[];
  overview?: string;
}

function toResult(item: TmdbApiItem, forcedType?: ItemType): TmdbResult {
  const type: ItemType =
    forcedType ?? (item.media_type === 'tv' ? 'series' : 'movie');
  const title = item.title || item.name || '';
  const date = item.release_date || item.first_air_date || '';
  return {
    tmdbId: item.id,
    type,
    title,
    year: date ? date.slice(0, 4) : '',
    posterUrl: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : undefined,
    genre: mapGenre(item.genre_ids),
    overview: item.overview || '',
  };
}

// Searches movies and series at once, ordered by TMDB popularity.
export async function searchTmdb(
  query: string,
  locale: Locale
): Promise<TmdbResult[]> {
  if (!API_KEY) {
    throw new Error('Falta NEXT_PUBLIC_TMDB_API_KEY en .env.local');
  }
  const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=${lang(
    locale
  )}&query=${encodeURIComponent(query)}&page=1&include_adult=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);

  const data: { results: TmdbApiItem[] } = await res.json();
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => toResult(r));
}

// Fetches the extra details we need (seasons for series, runtime for movies).
export async function getTmdbDetails(
  result: TmdbResult,
  locale: Locale
): Promise<TmdbDetails> {
  if (!API_KEY) {
    throw new Error('Falta NEXT_PUBLIC_TMDB_API_KEY en .env.local');
  }
  const path = result.type === 'series' ? 'tv' : 'movie';
  const url = `${BASE_URL}/${path}/${result.tmdbId}?api_key=${API_KEY}&language=${lang(
    locale
  )}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB details failed: ${res.status}`);

  const data: {
    number_of_seasons?: number;
    runtime?: number;
    genres?: { id: number }[];
    poster_path?: string | null;
  } = await res.json();

  // Detail endpoint gives full genre objects — refine the mapped genre.
  const genre = data.genres
    ? mapGenre(data.genres.map((g) => g.id))
    : result.genre;

  return {
    ...result,
    genre,
    posterUrl:
      result.posterUrl ??
      (data.poster_path ? `${IMAGE_BASE}${data.poster_path}` : undefined),
    totalSeasons:
      result.type === 'series' ? data.number_of_seasons ?? 1 : undefined,
    totalMinutes:
      result.type === 'movie' ? data.runtime ?? 0 : undefined,
  };
}
