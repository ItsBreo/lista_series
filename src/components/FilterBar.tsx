'use client';

import { Genre, ItemStatus } from '@/lib/types';
import { Locale, t, GENRES, STATUSES, getGenreLabel, getStatusLabel } from '@/lib/i18n';

interface FilterBarProps {
  locale: Locale;
  activeStatus: ItemStatus | 'all';
  activeGenre: Genre | 'all';
  searchTerm: string;
  onStatusChange: (status: ItemStatus | 'all') => void;
  onGenreChange: (genre: Genre | 'all') => void;
  onSearchChange: (value: string) => void;
}

export default function FilterBar({
  locale,
  activeStatus,
  activeGenre,
  searchTerm,
  onStatusChange,
  onGenreChange,
  onSearchChange,
}: FilterBarProps) {
  const tr = t(locale);

  return (
    <div className="filter-bar" id="filter-bar">
      {/* List search */}
      <div className="filter-search">
        <span className="filter-search-icon">🔍</span>
        <input
          className="filter-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tr.searchListPlaceholder}
          id="filter-search"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            className="filter-search-clear"
            onClick={() => onSearchChange('')}
            id="filter-search-clear"
            aria-label={tr.close}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-separator" />

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
