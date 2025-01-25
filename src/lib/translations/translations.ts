import i18n from 'sveltekit-i18n';

/** @type {import('sveltekit-i18n').Config} */
const config = ({
  loaders: [
    {
      locale: 'en',
      key: 'stats',
      loader: async () => (
        await import('./en/stats.json')
      ).default,
    },
    {
      locale: 'ja',
      key: 'stats',
      loader: async () => (
        await import('./ja/stats.json')
      ).default,
    },
  ],
});

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
