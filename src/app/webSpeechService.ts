import type { SpeechService } from '@/domain/ports';

/**
 * Pronunciació amb la Web Speech API (veus del sistema, 0 KB a l'app).
 * - Veu local japonesa (iOS, Android amb el paquet descarregat, Windows amb japonès): funciona offline.
 * - Veu remota (p. ex. "Google 日本語" a Chrome d'escriptori): només si hi ha connexió.
 * - Cap veu: el servei es declara no disponible i la UI desactiva el botó.
 */
export class WebSpeechService implements SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private readonly listeners = new Set<() => void>();
  private readonly synth: SpeechSynthesis | undefined;

  constructor(private readonly win: Window | undefined = typeof window === 'undefined' ? undefined : window) {
    this.synth = win?.speechSynthesis;
    if (!this.synth || !win) return;
    const refresh = () => {
      this.voices = this.synth!.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja'));
      this.emit();
    };
    refresh();
    this.synth.addEventListener?.('voiceschanged', refresh);
    win.addEventListener('online', () => this.emit());
    win.addEventListener('offline', () => this.emit());
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    const local = this.voices.find((v) => v.localService);
    if (local) return local;
    return this.win?.navigator.onLine ? this.voices[0] : undefined;
  }

  isAvailable(): boolean {
    return this.pickVoice() !== undefined;
  }

  speak(text: string): void {
    const voice = this.pickVoice();
    if (!this.synth || !voice) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.85;
    this.synth.speak(utterance);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }
}
