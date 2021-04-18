export const dbLanguages = <const>[
  'en',
];

export type DbLanguageId = typeof dbLanguages[number];

export const dbLanguageMeta: Array<
  [DbLanguageId, { name: string; hasKanji?: boolean; hasWords?: boolean }]
> = [
  ['en', { name: 'English', hasKanji: true, hasWords: true }],
];
