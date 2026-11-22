import { memo, type CSSProperties, type ReactNode } from 'react';
import { cx } from './cx';
import styles from './Chip.module.css';

export interface ChipProps {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
  /** To de la categoria: pinta el xip amb el seu color pastel. */
  hue?: number;
  leading?: ReactNode;
}

/** Xip commutable (aria-pressed). */
export const Chip = memo(function Chip({ selected, onToggle, children, hue, leading }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cx(styles.chip, selected && styles.selected)}
      data-hue={hue === undefined ? undefined : ''}
      style={hue === undefined ? undefined : ({ '--hue': hue } as CSSProperties)}
    >
      {leading && (
        <span className={styles.leading} aria-hidden="true">
          {leading}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
});
