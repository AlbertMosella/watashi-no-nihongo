import { useSettings, useUpdateSettings } from '@/app/hooks';
import { useT } from '@/app/i18n';
import { STUDENT_LANGUAGES, type StudentLanguage } from '@/domain/language';
import { newSeed } from '@/domain/random';
import type { FrontSide, ScriptMode, ThemePreference } from '@/domain/settings';
import { Button, SegmentedControl, Sheet, Switch } from '@/ui/components';
import styles from './Settings.module.css';

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const s = useSettings();
  const update = useUpdateSettings();

  return (
    <Sheet open={open} onClose={onClose} title={t('settings.title')} closeLabel={t('settings.close')}>
      <div className={styles.stack}>
        <SegmentedControl<StudentLanguage>
          label={t('settings.language')}
          value={s.language}
          options={STUDENT_LANGUAGES.map((l) => ({ value: l, label: t(`language.${l}`) }))}
          onChange={(language) => update({ language })}
        />
        <SegmentedControl<FrontSide>
          label={t('settings.front')}
          value={s.frontSide}
          options={[
            { value: 'native', label: t('settings.front.native') },
            { value: 'japanese', label: t('settings.front.japanese') },
          ]}
          onChange={(frontSide) => update({ frontSide })}
        />
        <SegmentedControl<ScriptMode>
          label={t('settings.script')}
          value={s.scriptMode}
          options={[
            { value: 'kanji', label: t('settings.script.kanji') },
            { value: 'kana', label: t('settings.script.kana') },
          ]}
          onChange={(scriptMode) => update({ scriptMode })}
        />

        <div className={styles.group}>
          <Switch label={t('settings.romaji')} checked={s.showRomaji} onChange={(showRomaji) => update({ showRomaji })} />
          <Switch
            label={t('settings.furigana')}
            checked={s.showFurigana}
            onChange={(showFurigana) => update({ showFurigana })}
          />
          <Switch
            label={t('settings.shuffle')}
            checked={s.shuffle}
            onChange={(shuffle) => update(shuffle ? { shuffle, shuffleSeed: newSeed() } : { shuffle })}
          />
          {s.shuffle && (
            <Button size="sm" icon="shuffle" onClick={() => update({ shuffleSeed: newSeed() })}>
              {t('settings.reshuffle')}
            </Button>
          )}
        </div>

        <SegmentedControl<ThemePreference>
          label={t('settings.theme')}
          value={s.theme}
          options={[
            { value: 'system', label: t('settings.theme.system') },
            { value: 'light', label: t('settings.theme.light') },
            { value: 'dark', label: t('settings.theme.dark') },
          ]}
          onChange={(theme) => update({ theme })}
        />

        <p className={styles.version}>
          v{__APP_VERSION__} · {new Date(__BUILD_DATE__).toLocaleString(s.language)}
        </p>
      </div>
    </Sheet>
  );
}
