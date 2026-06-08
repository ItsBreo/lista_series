'use client';

import { Locale } from '@/lib/i18n';

interface LanguageToggleProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageToggle({ locale, onChange }: LanguageToggleProps) {
  return (
    <div className="lang-toggle" id="lang-toggle">
      <button
        className={locale === 'es' ? 'active' : ''}
        onClick={() => onChange('es')}
        aria-label="Español"
      >
        ES
      </button>
      <button
        className={locale === 'en' ? 'active' : ''}
        onClick={() => onChange('en')}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
