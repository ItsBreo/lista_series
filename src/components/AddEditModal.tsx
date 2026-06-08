'use client';

import { useState, useEffect } from 'react';
import { WatchItem, ItemType, ItemStatus, Genre } from '@/lib/types';
import { Locale, t, GENRES, STATUSES, TYPES, getGenreLabel, getStatusLabel, getTypeLabel } from '@/lib/i18n';

interface AddEditModalProps {
  locale: Locale;
  item?: WatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WatchItem>) => void;
}

export default function AddEditModal({
  locale,
  item,
  isOpen,
  onClose,
  onSave,
}: AddEditModalProps) {
  const tr = t(locale);
  const isEditing = !!item;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ItemType>('series');
  const [genre, setGenre] = useState<Genre>('drama');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ItemStatus>('pending');
  const [notes, setNotes] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [rating, setRating] = useState(0);

  // Series fields
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(0);

  // Movie fields
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setType(item.type);
      setGenre(item.genre);
      setImageUrl(item.imageUrl || '');
      setStatus(item.status);
      setNotes(item.notes || '');
      setAddedBy(item.addedBy || '');
      setRating(item.rating || 0);
      setTotalSeasons(item.totalSeasons || 1);
      setCurrentSeason(item.currentSeason || 1);
      setCurrentEpisode(item.currentEpisode || 0);
      setTotalMinutes(item.totalMinutes || 0);
      setCurrentMinute(item.currentMinute || 0);
    } else {
      // Reset form
      setTitle('');
      setType('series');
      setGenre('drama');
      setImageUrl('');
      setStatus('pending');
      setNotes('');
      setAddedBy('');
      setRating(0);
      setTotalSeasons(1);
      setCurrentSeason(1);
      setCurrentEpisode(0);
      setTotalMinutes(0);
      setCurrentMinute(0);
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: Partial<WatchItem> = {
      title: title.trim(),
      type,
      genre,
      imageUrl: imageUrl.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      addedBy: addedBy.trim() || undefined,
      ...(status === 'completed' && rating > 0 ? { rating } : {}),
    };

    if (type === 'series') {
      data.totalSeasons = totalSeasons;
      data.currentSeason = currentSeason;
      data.currentEpisode = currentEpisode;
    } else {
      data.totalMinutes = totalMinutes;
      data.currentMinute = currentMinute;
    }

    if (item) {
      data.id = item.id;
    }

    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} id="add-edit-modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? tr.editItem : tr.addNew}</h2>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            id="modal-close-btn"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-title">{tr.title} *</label>
              <input
                id="field-title"
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tr.titlePlaceholder}
                required
                autoFocus
              />
            </div>

            {/* Type and Genre */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="field-type">{tr.type}</label>
                <select
                  id="field-type"
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as ItemType)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {getTypeLabel(t, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-genre">{tr.genre}</label>
                <select
                  id="field-genre"
                  className="form-select"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {getGenreLabel(g, locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-status">{tr.status}</label>
              <select
                id="field-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s, locale)}
                  </option>
                ))}
              </select>
            </div>

            {/* Series-specific fields */}
            {type === 'series' && (
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-total-seasons">
                    {tr.totalSeasons}
                  </label>
                  <input
                    id="field-total-seasons"
                    className="form-input"
                    type="number"
                    min={1}
                    value={totalSeasons}
                    onChange={(e) => setTotalSeasons(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-current-season">
                    {tr.currentSeason}
                  </label>
                  <input
                    id="field-current-season"
                    className="form-input"
                    type="number"
                    min={1}
                    max={totalSeasons}
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-current-episode">
                    {tr.currentEpisode}
                  </label>
                  <input
                    id="field-current-episode"
                    className="form-input"
                    type="number"
                    min={0}
                    value={currentEpisode}
                    onChange={(e) => setCurrentEpisode(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {/* Movie-specific fields */}
            {type === 'movie' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-total-minutes">
                    {tr.totalMinutes}
                  </label>
                  <input
                    id="field-total-minutes"
                    className="form-input"
                    type="number"
                    min={0}
                    value={totalMinutes}
                    onChange={(e) => setTotalMinutes(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-current-minute">
                    {tr.currentMinute}
                  </label>
                  <input
                    id="field-current-minute"
                    className="form-input"
                    type="number"
                    min={0}
                    max={totalMinutes}
                    value={currentMinute}
                    onChange={(e) => setCurrentMinute(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {/* Rating (only when completed) */}
            {status === 'completed' && (
              <div className="form-group">
                <label className="form-label">{tr.rating}</label>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`rating-star ${star <= rating ? 'filled' : 'empty'}`}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      role="button"
                      tabIndex={0}
                      id={`rating-star-${star}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-image-url">
                {tr.imageUrl}
              </label>
              <input
                id="field-image-url"
                className="form-input"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={tr.imageUrlPlaceholder}
              />
            </div>

            {/* Added by */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-added-by">
                {tr.addedBy}
              </label>
              <input
                id="field-added-by"
                className="form-input"
                type="text"
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder={tr.addedByPlaceholder}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-notes">{tr.notes}</label>
              <textarea
                id="field-notes"
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tr.notesPlaceholder}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              id="modal-cancel-btn"
            >
              {tr.cancel}
            </button>
            <button type="submit" className="btn btn-primary" id="modal-save-btn">
              {tr.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
