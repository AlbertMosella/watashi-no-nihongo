import { useId, type KeyboardEvent } from 'react';
import { cx } from './cx';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  /** L'etiqueta només per a lectors de pantalla (p. ex. a la barra d'eines). */
  hideLabel?: boolean;
  className?: string;
}

/** Grup d'opcions exclusives (radiogroup accessible amb fletxes). */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel,
  className,
}: SegmentedControlProps<T>) {
  const labelId = useId();
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = options[(index + delta + options.length) % options.length]!;
    onChange(next.value);
    (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
  };

  return (
    <div className={cx(styles.field, className)}>
      <span id={labelId} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={styles.group}
        onKeyDown={onKeyDown}
        style={{ '--count': options.length, '--index': index } as React.CSSProperties}
      >
        <span className={styles.indicator} aria-hidden="true" />
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              data-value={option.value}
              className={cx(styles.option, checked && styles.checked)}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
