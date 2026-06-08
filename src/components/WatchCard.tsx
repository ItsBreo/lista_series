'use client';

import { WatchItem } from '@/lib/types';
import { Locale, t, getGenreLabel, getStatusLabel, getTypeLabel } from '@/lib/i18n';
import { updateProgress, updateMovieProgress } from '@/lib/watchlist-service';
import ProgressBar from './ProgressBar';

interface WatchCardProps {
  item: WatchItem;
  locale: Locale;
  onEdit: (item: WatchItem) => void;
  onDelete: (item: WatchItem) => void;
  onOpenDetail: (item: WatchItem) => void;
  style?: React.CSSProperties;
}

export default function WatchCard({ item, locale, onEdit, onDelete, onOpenDetail, style }: WatchCardProps) {
  const tr = t(locale);

  // Calculate progress
  const getProgress = (): { current: number; total: number; label: string; percent: number } => {
    if (item.type === 'series') {
      const totalEpisodes = (item.totalSeasons || 1) * 10; // Rough estimate
      const currentTotal =
        ((item.currentSeason || 1) - 1) * 10 + (item.currentEpisode || 0);
      const percent = totalEpisodes > 0 ? Math.round((currentTotal / totalEpisodes) * 100) : 0;
      return {
        current: currentTotal,
        total: totalEpisodes,
        label: `${tr.seasonShort}${item.currentSeason || 1}, ${tr.episodeShort} ${item.currentEpisode || 0}`,
        percent: Math.min(percent, 100),
      };
    } else {
      const percent =
        item.totalMinutes && item.totalMinutes > 0
          ? Math.round(((item.currentMinute || 0) / item.totalMinutes) * 100)
          : 0;
      return {
        current: item.currentMinute || 0,
        total: item.totalMinutes || 0,
        label: `${item.currentMinute || 0} ${tr.min} ${tr.of} ${item.totalMinutes || '?'}`,
        percent: Math.min(percent, 100),
      };
    }
  };

  const progress = getProgress();
  const isCompleted = item.status === 'completed';

  const handleEpisodeIncrement = async () => {
    const newEp = (item.currentEpisode || 0) + 1;
    await updateProgress(item.id, item.currentSeason || 1, newEp);
  };

  const handleEpisodeDecrement = async () => {
    const newEp = Math.max(0, (item.currentEpisode || 0) - 1);
    await updateProgress(item.id, item.currentSeason || 1, newEp);
  };

  const handleSeasonIncrement = async () => {
    const newSeason = (item.currentSeason || 1) + 1;
    if (!item.totalSeasons || newSeason <= item.totalSeasons) {
      await updateProgress(item.id, newSeason, 1);
    }
  };

  const handleMinuteIncrement = async () => {
    const newMin = Math.min((item.currentMinute || 0) + 5, item.totalMinutes || 9999);
    await updateMovieProgress(item.id, newMin);
  };

  const handleMinuteDecrement = async () => {
    const newMin = Math.max(0, (item.currentMinute || 0) - 5);
    await updateMovieProgress(item.id, newMin);
  };

  const renderRating = () => {
    if (!item.rating) return null;
    return (
      <div className="rating-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`rating-star ${star <= item.rating! ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="watch-card" style={style} id={`card-${item.id}`}>
      {/* Poster */}
      <div
        className="card-poster card-poster-clickable"
        onClick={() => onOpenDetail(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpenDetail(item);
        }}
        title={item.title}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} loading="lazy" />
        ) : (
          <span className="card-poster-placeholder">
            {item.type === 'series' ? '📺' : '🎬'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <h3
            className="card-title card-title-clickable"
            onClick={() => onOpenDetail(item)}
            title={item.title}
          >
            {item.title}
          </h3>
        </div>

        {/* Meta badges */}
        <div className="card-meta">
          <span className="card-badge badge-type">{getTypeLabel(item.type, locale)}</span>
          <span className="card-badge badge-genre">{getGenreLabel(item.genre, locale)}</span>
          <span className={`card-badge badge-${item.status}`}>
            {getStatusLabel(item.status, locale)}
          </span>
        </div>

        {/* Progress section */}
        {!isCompleted && (
          <div className="card-progress-section">
            <div className="card-progress-label">
              <span className="card-progress-info">
                {progress.label}
                {item.type === 'series' && item.totalSeasons && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                    {' '}
                    · {item.totalSeasons} {tr.season.toLowerCase()}
                    {item.totalSeasons > 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <span className="card-progress-percent">{progress.percent}%</span>
            </div>
            <ProgressBar
              current={progress.current}
              total={progress.total}
              completed={isCompleted}
            />
          </div>
        )}

        {/* Completed rating */}
        {isCompleted && renderRating()}

        {/* Quick controls */}
        {!isCompleted && (
          <div className="quick-controls">
            {item.type === 'series' ? (
              <>
                <button
                  className="quick-btn"
                  onClick={handleEpisodeDecrement}
                  title={`- ${tr.episode}`}
                  id={`btn-ep-dec-${item.id}`}
                >
                  −
                </button>
                <button
                  className="quick-btn"
                  onClick={handleEpisodeIncrement}
                  title={`+ ${tr.episode}`}
                  id={`btn-ep-inc-${item.id}`}
                >
                  +
                </button>
                {item.totalSeasons && (item.currentSeason || 1) < item.totalSeasons && (
                  <button
                    className="quick-btn"
                    onClick={handleSeasonIncrement}
                    title={`+ ${tr.season}`}
                    id={`btn-season-inc-${item.id}`}
                    style={{ marginLeft: '4px', fontSize: '0.7rem' }}
                  >
                    {tr.seasonShort}+
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  className="quick-btn"
                  onClick={handleMinuteDecrement}
                  title="-5 min"
                  id={`btn-min-dec-${item.id}`}
                >
                  −5
                </button>
                <button
                  className="quick-btn"
                  onClick={handleMinuteIncrement}
                  title="+5 min"
                  id={`btn-min-inc-${item.id}`}
                >
                  +5
                </button>
              </>
            )}
          </div>
        )}

        {/* Notes */}
        {item.notes && <p className="card-notes">📝 {item.notes}</p>}

        {/* Footer */}
        <div className="card-footer">
          {item.addedBy ? (
            <span className="card-added-by">
              {tr.addedBy}: {item.addedBy}
            </span>
          ) : (
            <span />
          )}
          <div className="card-actions">
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => onEdit(item)}
              title={tr.edit}
              id={`btn-edit-${item.id}`}
            >
              ✏️
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => onDelete(item)}
              title={tr.delete}
              id={`btn-delete-${item.id}`}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
