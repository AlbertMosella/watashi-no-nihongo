import { useEffect, useId, useRef } from 'react';
import { useT } from '@/app/i18n';
import { Icon } from '@/ui/components';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onClose: () => void;
  /** Nombre de resultats (null mentre es carreguen les targetes o si no hi ha cerca). */
  count: number | null;
}

/** Camp de cerca de targetes amb el comptador de resultats. Esc el tanca. */
export function SearchBar({ query, onChange, onClose, count }: SearchBarProps) {
  const t = useT();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const label = count === null ? '' : count === 1 ? t('search.result') : t('search.results', { n: count });

  return (
    <div className={styles.bar} role="search">
      <label htmlFor={id} className="visually-hidden">
        {t('search.label')}
      </label>
      <span className={styles.icon} aria-hidden="true">
        <Icon name="search" size={18} />
      </span>
      <input
        ref={input}
        id={id}
        className={styles.input}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
      <span className={styles.count} aria-live="polite">
        {query.trim() ? label : ''}
      </span>
      {query && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t('search.clear')}
          onClick={() => {
            onChange('');
            input.current?.focus();
          }}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
