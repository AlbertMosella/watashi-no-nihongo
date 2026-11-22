# Watashi no Nihongo 私の日本語

PWA per aprendre japonès amb dos apartats:

- **Targetes:** hiragana, katakana, kanji i vocabulari per categories.
- **Converses:** diàlegs curts per temàtiques (presentar-se, restaurant, orientar-se…)
  amb la traducció a sota i un mode pràctica que amaga les respostes.

Funciona 100% offline i s'instal·la al mòbil.

## Scripts

```bash
pnpm install
pnpm dev            # servidor de desenvolupament
pnpm test           # tests (Vitest)
pnpm lint           # ESLint
pnpm build          # typecheck + build de producció (dist/)
pnpm preview        # serveix dist/ (amb service worker) per provar la PWA
pnpm generate:kana  # regenera els JSON de kana
pnpm generate:icons # regenera les icones PNG des de public/favicon.svg
```

## Arquitectura

```
src/
  domain/   Regles pures, sense React ni navegador: entitats, furigana, romaji,
            barreja, què es mostra a cada cara (faces.ts), preferències i ports (interfícies).
  data/     Implementacions dels ports: repositori JSON (un chunk per categoria,
            carregat a demanda i en cache), localStorage, registre de categories i dades.
  app/      Casos d'ús i estat: store de preferències (useSyncExternalStore), hooks,
            i18n de la UI, veu (Web Speech), actualitzacions PWA i composition root (services.tsx).
  ui/       React: components reutilitzables (components/), tema (theme/) i funcionalitats (features/).
```

- **Inversió de dependències:** la UI només coneix `CardRepository`, `SpeechService`, etc.
  Les implementacions es trien a `src/app/services.tsx` i els tests hi injecten dobles.
- **Rendiment:**
  - Virtualitzador propi (`useCardScroller`): només hi ha 5 targetes al DOM.
  - L'animació de scroll s'escriu com a variables CSS a cada frame, sense passar per React.
  - Les dades es carreguen en chunks per categoria amb `JSON.parse`.
  - Els panells es carreguen amb lazy loading.
  - Fonts del sistema (0 KB).

## Dades

Cada categoria és `src/data/cards/<id>.json` i està registrada a `src/data/categories.ts`.
L'etiqueta de cada categoria és a `src/app/i18n/*.ts`.

```json
{ "jp": "食[た]べる", "ca": "menjar", "es": "comer", "en": "to eat" }
```

- `jp` fa servir la notació de furigana: la lectura entre claudàtors s'aplica als kanji immediatament anteriors.
- El romaji es calcula automàticament. El camp opcional `r` el força, per exemple per a partícules (は → wa).
- `src/data/dataset.test.ts` valida totes les dades: format, furigana, romaji i duplicats.

### Converses

Cada temàtica és `src/data/conversations/<id>.json` i està registrada a `src/data/topics.ts`.
El format està documentat a `src/data/rawConversations.ts`.

```json
{ "s": "staff", "jp": "何名様[なんめいさま]ですか。", "r": "nanmei-sama desu ka?", "ca": "Quantes persones són?", "es": "...", "en": "..." }
```

- `s` és qui parla: `you` és sempre l'estudiant, i la resta es defineixen a `speakers`.
- Aquí el romaji (`r`) és obligatori, perquè les frases tenen partícules i espais.
- `src/data/conversations.test.ts` valida totes les converses.

## PWA i actualitzacions

`vite-plugin-pwa` genera el service worker i precacheja tota l'app, dades incloses.
`src/app/pwaUpdates.ts` gestiona el flux:

1. Un deploy nou genera un `sw.js` diferent.
2. L'app el busca en obrir-se, en tornar a primer pla i cada 30 minuts.
3. Quan el troba, el descarrega i el deixa en espera.
4. Apareix l'avís «Hi ha una versió nova · Actualitzar».
5. En prémer-lo, el SW nou pren el control i la pàgina es recarrega.

`netlify.toml` evita que `sw.js` quedi en cache HTTP.

## Deploy (Netlify)

Connecta el repositori de GitHub a Netlify. La configuració ja és a `netlify.toml`
(`pnpm build`, carpeta `dist`, Node 22).

## Fase 2

- «Ja la sé / Repassar» amb repetició espaiada (els ids de targeta ja són estables).
