'use client';

import { WatchItem } from '@/lib/types';
import {
  Locale,
  t,
  getGenreLabel,
  getStatusLabel,
  getTypeLabel,
} from '@/lib/i18n';

interface DetailModalProps {
  locale: Locale;
  item: WatchItem | null;
  onClose: () => void;
  onEdit: (item: WatchItem) => void;
}

export default function DetailModal({
  locale,
  item,
  onClose,
  onEdit,
}: DetailModalProps) {
  if (!item) return null;
  const tr = t(locale);

  const progressText =
    item.type === 'series'
      ? `${tr.seasonShort}${item.currentSeason || 1} · ${tr.episodeShort} ${
          item.currentEpisode || 0
        }${
          item.totalSeasons
            ? ` · ${item.totalSeasons} ${tr.season.toLowerCase()}${
                item.totalSeasons > 1 ? 's' : ''
              }`
            : ''
        }`
      : `${item.currentMinute || 0} ${tr.min} ${tr.of} ${
          item.totalMinutes || '?'
        } ${tr.min}`;

  const createdDate = item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="modal-overlay" onClick={onClose} id="detail-overlay">
      <div
        className="modal detail-modal"
        onClick={(e) => e.stopPropagation()}
        id="detail-modal"
      >
        <button
          className="btn btn-ghost btn-icon detail-close"
          onClick={onClose}
          id="detail-close-btn"
          aria-label={tr.close}
        >
          ✕
        </button>

        {/* Hero: poster + main info */}
        <div className="detail-hero">
          <div className="detail-poster">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.title} />
            ) : (
              <span className="detail-poster-placeholder">
                {item.type === 'series' ? '📺' : '🎬'}
              </span>
            )}
          </div>

          <div className="detail-info">
            <h2 className="detail-title">{item.title}</h2>

            <div className="detail-badges">
              <span className="card-badge badge-type">
                {getTypeLabel(item.type, locale)}
              </span>
              <span className="card-badge badge-genre">
                {getGenreLabel(item.genre, locale)}
              </span>
              <span className={`card-badge badge-${item.status}`}>
                {getStatusLabel(item.status, locale)}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{tr.progress}</span>
              <span className="detail-value">{progressText}</span>
            </div>

            {item.rating ? (
              <div className="detail-row">
                <span className="detail-label">{tr.rating}</span>
                <span className="rating-display">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`rating-star ${
                        star <= item.rating! ? 'filled' : 'empty'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </span>
              </div>
            ) : null}

            {item.addedBy ? (
              <div className="detail-row">
                <span className="detail-label">{tr.addedBy}</span>
                <span className="detail-value">{item.addedBy}</span>
              </div>
            ) : null}

            {createdDate ? (
              <div className="detail-row">
                <span className="detail-label">
                  {locale === 'es' ? 'Añadido' : 'Added'}
                </span>
                <span className="detail-value">{createdDate}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Notes — full text, scrollable */}
        {item.notes ? (
          <div className="detail-notes">
            <span className="detail-label">{tr.notes}</span>
            <p className="detail-notes-text">{item.notes}</p>
          </div>
        ) : null}

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            id="detail-footer-close"
          >
            {tr.close}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onEdit(item)}
            id="detail-edit-btn"
          >
            ✏️ {tr.edit}
          </button>
        </div>
      </div>
    </div>
  );
}
