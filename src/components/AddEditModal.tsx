'use client';

import { useState, useEffect } from 'react';
import { WatchItem, ItemType, ItemStatus, Genre } from '@/lib/types';
import { Locale, t, GENRES, STATUSES, TYPES, getGenreLabel, getStatusLabel, getTypeLabel } from '@/lib/i18n';

interface AddEditModalProps {
  locale: Locale;
  item?: WatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WatchItem>) => Promise<boolean>;
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
  const [saving, setSaving] = useState(false);

  // Series fields
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(0);

  // Movie fields
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const optionalLabel = locale === 'es' ? 'opcional' : 'optional';

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
    setErrors({});
    setTouched({});
    setSaving(false);
  }, [item, isOpen]);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = locale === 'es' ? 'El título es obligatorio' : 'Title is required';
    }

    if (type === 'series' && totalSeasons < 1) {
      errs.totalSeasons = locale === 'es' ? 'Mínimo 1 temporada' : 'Minimum 1 season';
    }

    if (type === 'series' && currentSeason > totalSeasons) {
      errs.currentSeason =
        locale === 'es'
          ? `No puede ser mayor que ${totalSeasons}`
          : `Cannot be greater than ${totalSeasons}`;
    }

    if (type === 'movie' && totalMinutes > 0 && currentMinute > totalMinutes) {
      errs.currentMinute =
        locale === 'es'
          ? `No puede ser mayor que ${totalMinutes}`
          : `Cannot be greater than ${totalMinutes}`;
    }

    if (imageUrl.trim() && !isValidUrl(imageUrl.trim())) {
      errs.imageUrl = locale === 'es' ? 'URL no válida' : 'Invalid URL';
    }

    return errs;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate();
    setErrors(errs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      title: true,
      totalSeasons: true,
      currentSeason: true,
      currentMinute: true,
      imageUrl: true,
    });

    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setSaving(true);

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

    const success = await onSave(data);
    setSaving(false);
    if (!success) {
      // Error is handled by parent via toast
    }
  };

  if (!isOpen) return null;

  const getFieldClass = (field: string): string => {
    if (touched[field] && errors[field]) return 'form-input form-input-error';
    return 'form-input';
  };

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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Title — REQUIRED */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-title">
                {tr.title} <span className="form-required">*</span>
              </label>
              <input
                id="field-title"
                className={getFieldClass('title')}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder={tr.titlePlaceholder}
                autoFocus
              />
              {touched.title && errors.title && (
                <span className="form-error">{errors.title}</span>
              )}
            </div>

            {/* Type and Genre — REQUIRED (have defaults) */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="field-type">
                  {tr.type} <span className="form-required">*</span>
                </label>
                <select
                  id="field-type"
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as ItemType)}
                >
                  {TYPES.map((tp) => (
                    <option key={tp} value={tp}>
                      {getTypeLabel(tp, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-genre">
                  {tr.genre} <span className="form-required">*</span>
                </label>
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

            {/* Status — REQUIRED (has default) */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-status">
                {tr.status} <span className="form-required">*</span>
              </label>
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

            {/* Series-specific fields — REQUIRED when type=series */}
            {type === 'series' && (
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-total-seasons">
                    {tr.totalSeasons} <span className="form-required">*</span>
                  </label>
                  <input
                    id="field-total-seasons"
                    className={getFieldClass('totalSeasons')}
                    type="number"
                    min={1}
                    value={totalSeasons}
                    onChange={(e) => setTotalSeasons(parseInt(e.target.value) || 1)}
                    onBlur={() => handleBlur('totalSeasons')}
                  />
                  {touched.totalSeasons && errors.totalSeasons && (
                    <span className="form-error">{errors.totalSeasons}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-current-season">
                    {tr.currentSeason} <span className="form-required">*</span>
                  </label>
                  <input
                    id="field-current-season"
                    className={getFieldClass('currentSeason')}
                    type="number"
                    min={1}
                    max={totalSeasons}
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(parseInt(e.target.value) || 1)}
                    onBlur={() => handleBlur('currentSeason')}
                  />
                  {touched.currentSeason && errors.currentSeason && (
                    <span className="form-error">{errors.currentSeason}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-current-episode">
                    {tr.currentEpisode} <span className="form-required">*</span>
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
                    {tr.totalMinutes} <span className="form-required">*</span>
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
                    {tr.currentMinute}{' '}
                    <span className="form-optional">({optionalLabel})</span>
                  </label>
                  <input
                    id="field-current-minute"
                    className={getFieldClass('currentMinute')}
                    type="number"
                    min={0}
                    max={totalMinutes}
                    value={currentMinute}
                    onChange={(e) => setCurrentMinute(parseInt(e.target.value) || 0)}
                    onBlur={() => handleBlur('currentMinute')}
                  />
                  {touched.currentMinute && errors.currentMinute && (
                    <span className="form-error">{errors.currentMinute}</span>
                  )}
                </div>
              </div>
            )}

            {/* Rating (only when completed) — OPTIONAL */}
            {status === 'completed' && (
              <div className="form-group">
                <label className="form-label">
                  {tr.rating}{' '}
                  <span className="form-optional">({optionalLabel})</span>
                </label>
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

            {/* Image URL — OPTIONAL */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-image-url">
                {tr.imageUrl}{' '}
                <span className="form-optional">({optionalLabel})</span>
              </label>
              <input
                id="field-image-url"
                className={getFieldClass('imageUrl')}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onBlur={() => handleBlur('imageUrl')}
                placeholder={tr.imageUrlPlaceholder}
              />
              {touched.imageUrl && errors.imageUrl && (
                <span className="form-error">{errors.imageUrl}</span>
              )}
            </div>

            {/* Added by — OPTIONAL */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-added-by">
                {tr.addedBy}{' '}
                <span className="form-optional">({optionalLabel})</span>
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

            {/* Notes — OPTIONAL */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-notes">
                {tr.notes}{' '}
                <span className="form-optional">({optionalLabel})</span>
              </label>
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
              disabled={saving}
            >
              {tr.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="modal-save-btn"
              disabled={saving}
            >
              {saving ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  {locale === 'es' ? 'Guardando...' : 'Saving...'}
                </span>
              ) : (
                tr.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
