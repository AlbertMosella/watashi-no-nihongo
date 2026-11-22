import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Quantes targetes es pinten a cada costat de l'actual (2 + 1 + 2 = 5 al DOM). */
export const OVERSCAN = 2;

/**
 * Salt directe a una posició llunyana. Els punts de snap només existeixen a les targetes
 * pintades, així que el navegador "enganxaria" el salt a l'última visible: desactivem el
 * snap mentre la finestra de targetes es torna a pintar al voltant de la destinació.
 */
function jumpTo(el: HTMLElement, top: number): void {
  el.style.scrollSnapType = 'none';
  el.scrollTop = top;
  setTimeout(() => {
    el.style.scrollSnapType = '';
  }, 120);
}

export interface CardScroller {
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Alçada d'una targeta (= alçada del contenidor). 0 fins que es mesura. */
  itemHeight: number;
  current: number;
  /** Índexs a pintar: només la finestra al voltant de l'actual. */
  range: { start: number; end: number };
  /** Registra el node d'una targeta: rebrà el progrés de scroll via variables CSS sense re-render. */
  registerItem: (index: number, el: HTMLElement | null) => void;
  scrollToIndex: (index: number, smooth?: boolean) => void;
}

/**
 * Virtualitzador vertical a mida per a targetes a pantalla completa:
 *  - El contenidor fa scroll natiu (inèrcia del mòbil) amb scroll-snap.
 *  - Un espaiador dona l'alçada total; només es pinten OVERSCAN*2+1 targetes, posicionades per índex.
 *  - L'animació de scroll no passa per React: a cada frame s'escriu --p (posició relativa, -1..1)
 *    a les targetes visibles i el CSS fa la resta amb transform/opacity (GPU).
 *  - React només es repinta quan canvia la targeta actual.
 */
export function useCardScroller(count: number, resetKey: unknown): CardScroller {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<number, HTMLElement>());
  const [itemHeight, setItemHeight] = useState(0);
  const [current, setCurrent] = useState(0);
  const heightRef = useRef(0);
  const frame = useRef(0);
  const currentRef = useRef(0);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const paint = useCallback(() => {
    const el = containerRef.current;
    const h = heightRef.current;
    if (!el || !h) return;
    const position = el.scrollTop / h;
    for (const [index, item] of items.current) {
      const p = Math.max(-1.5, Math.min(1.5, index - position));
      item.style.setProperty('--p', p.toFixed(4));
      item.style.setProperty('--ap', Math.min(1, Math.abs(p)).toFixed(4));
    }
    const next = Math.min(Math.max(Math.round(position), 0), Math.max(count - 1, 0));
    setCurrent((prev) => (prev === next ? prev : next));
  }, [count]);

  // Mesura el contenidor (canvis d'orientació, barra d'adreces del mòbil...).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      if (h && h !== heightRef.current) {
        // Mantén la targeta actual en canviar la mida.
        const index = heightRef.current ? Math.round(el.scrollTop / heightRef.current) : 0;
        heightRef.current = h;
        setItemHeight(h);
        jumpTo(el, index * h);
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(paint);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    paint();
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, [paint]);

  // Mall nou (filtres, barreja...): torna al principi.
  // (Ajust d'estat durant el render, el patró recomanat per React en lloc d'un efecte.)
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setCurrent(0);
  }
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) jumpTo(el, 0);
  }, [resetKey]);

  const registerItem = useCallback((index: number, el: HTMLElement | null) => {
    if (el) {
      items.current.set(index, el);
      const h = heightRef.current;
      const position = h && containerRef.current ? containerRef.current.scrollTop / h : 0;
      const p = Math.max(-1.5, Math.min(1.5, index - position));
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--ap', Math.min(1, Math.abs(p)).toFixed(4));
    } else {
      items.current.delete(index);
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const el = containerRef.current;
      if (!el || !heightRef.current) return;
      const target = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
      const top = target * heightRef.current;
      // Les targetes properes ja són al DOM (punts de snap): es pot fer scroll suau.
      if (smooth && Math.abs(target - currentRef.current) <= OVERSCAN) el.scrollTo({ top, behavior: 'smooth' });
      else jumpTo(el, top);
    },
    [count],
  );

  return {
    containerRef,
    itemHeight,
    current,
    range: { start: Math.max(0, current - OVERSCAN), end: Math.min(count - 1, current + OVERSCAN) },
    registerItem,
    scrollToIndex,
  };
}
