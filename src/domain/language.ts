export const STUDENT_LANGUAGES = ['ca', 'es', 'en'] as const;

export type StudentLanguage = (typeof STUDENT_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: StudentLanguage = 'ca';

/** Un text traduït a tots els idiomes de l'estudiant. */
export type Translations = Readonly<Record<StudentLanguage, string>>;

export function isStudentLanguage(value: unknown): value is StudentLanguage {
  return typeof value === 'string' && (STUDENT_LANGUAGES as readonly string[]).includes(value);
}
