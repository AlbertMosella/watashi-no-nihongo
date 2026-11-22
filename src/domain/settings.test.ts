import { DEFAULT_SETTINGS, sanitizeSettings } from './settings';

describe('sanitizeSettings', () => {
  it('retorna els valors per defecte amb dades buides o corruptes', () => {
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('hola')).toEqual(DEFAULT_SETTINGS);
  });

  it('conserva els camps vàlids i descarta els invàlids', () => {
    const s = sanitizeSettings({ language: 'en', frontSide: 'xx', showRomaji: false, theme: 'dark' });
    expect(s.language).toBe('en');
    expect(s.frontSide).toBe(DEFAULT_SETTINGS.frontSide);
    expect(s.showRomaji).toBe(false);
    expect(s.theme).toBe('dark');
  });

  it('elimina categories desconegudes i duplicades', () => {
    const s = sanitizeSettings({ categoryIds: ['a', 'a', 'zz', 3] }, new Set(['a', 'b']));
    expect(s.categoryIds).toEqual(['a']);
  });
});
