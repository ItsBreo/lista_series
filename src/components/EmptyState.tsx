'use client';

import { Locale, t } from '@/lib/i18n';

interface EmptyStateProps {
  locale: Locale;
  onAdd: () => void;
}

export default function EmptyState({ locale, onAdd }: EmptyStateProps) {
  const tr = t(locale);

  return (
    <div className="empty-state">
      <div className="empty-icon">🎬</div>
      <h2 className="empty-title">{tr.emptyTitle}</h2>
      <p className="empty-message">{tr.emptyMessage}</p>
      <button className="btn btn-primary" onClick={onAdd} id="empty-add-btn">
        <span>+</span> {tr.emptyAction}
      </button>
    </div>
  );
}
