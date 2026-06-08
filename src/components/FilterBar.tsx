'use client';

import { Genre, ItemStatus } from '@/lib/types';
import { Locale, t, GENRES, STATUSES, getGenreLabel, getStatusLabel } from '@/lib/i18n';

interface FilterBarProps {
  locale: Locale;
  activeStatus: ItemStatus | 'all';
  activeGenre: Genre | 'all';
  onStatusChange: (status: ItemStatus | 'all') => void;
  onGenreChange: (genre: Genre | 'all') => void;
}

export default function FilterBar({
  locale,
  activeStatus,
  activeGenre,
  onStatusChange,
  onGenreChange,
}: FilterBarProps) {
  const tr = t(locale);

  return (
    <div className="filter-bar" id="filter-bar">
      {/* Status filter chips */}
      <div className="filter-group">
        <button
          className={`filter-chip${activeStatus === 'all' ? ' active' : ''}`}
          onClick={() => onStatusChange('all')}
          id="filter-status-all"
        >
          {tr.all}
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`filter-chip${activeStatus === status ? ' active' : ''}`}
            onClick={() => onStatusChange(status)}
            id={`filter-status-${status}`}
          >
            <span
              className="stat-dot"
              style={{
                background:
                  status === 'watching'
                    ? 'var(--status-watching)'
                    : status === 'completed'
                    ? 'var(--status-completed)'
                    : 'var(--status-pending)',
              }}
            />
            {getStatusLabel(status, locale)}
          </button>
        ))}
      </div>

      <div className="filter-separator" />

      {/* Genre filter dropdown */}
      <select
        className={`filter-select${activeGenre !== 'all' ? ' active' : ''}`}
        value={activeGenre}
        onChange={(e) => onGenreChange(e.target.value as Genre | 'all')}
        id="filter-genre"
      >
        <option value="all">{tr.allGenres}</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {getGenreLabel(genre, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
