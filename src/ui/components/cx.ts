/** Uneix noms de classe ignorant els valors buits. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
