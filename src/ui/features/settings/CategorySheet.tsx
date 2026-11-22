import { useMemo } from 'react';
import { useSetting, useUpdateSettings } from '@/app/hooks';
import { categoryLabelKey, useT, type MessageKey } from '@/app/i18n';
import { useServices } from '@/app/services';
import type { Category, CategoryGroup } from '@/domain/category';
import { Button, Chip, Sheet } from '@/ui/components';
import styles from './Settings.module.css';

const GROUPS: readonly CategoryGroup[] = ['kana', 'kanji', 'vocab'];

export function CategorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const { cards } = useServices();
  const selectedIds = useSetting('categoryIds');
  const update = useUpdateSettings();
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const byGroup = useMemo(() => {
    const map = new Map<CategoryGroup, Category[]>();
    for (const c of cards.getCategories()) map.set(c.group, [...(map.get(c.group) ?? []), c]);
    return map;
  }, [cards]);

  const setGroup = (ids: string[], on: boolean) =>
    update((s) => ({
      categoryIds: on ? [...new Set([...s.categoryIds, ...ids])] : s.categoryIds.filter((id) => !ids.includes(id)),
    }));

  const toggle = (id: string) => setGroup([id], !selected.has(id));

  return (
    <Sheet open={open} onClose={onClose} title={t('filters.title')} closeLabel={t('settings.close')}>
      <div className={styles.stack}>
        {GROUPS.map((group) => {
          const list = byGroup.get(group) ?? [];
          const ids = list.map((c) => c.id);
          const all = ids.every((id) => selected.has(id));
          return (
            <section key={group} className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3>{t(`group.${group}` as MessageKey)}</h3>
                <Button size="sm" variant="ghost" onClick={() => setGroup(ids, !all)}>
                  {all ? t('filters.none') : t('filters.all')}
                </Button>
              </header>
              <div className={styles.chips}>
                {list.map((c) => (
                  <Chip
                    key={c.id}
                    hue={c.hue}
                    selected={selected.has(c.id)}
                    onToggle={() => toggle(c.id)}
                    leading={c.emoji}
                  >
                    {t(categoryLabelKey(c.id))}
                  </Chip>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Sheet>
  );
}
