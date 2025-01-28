import { loadTranslations } from '../lib/translations/translations';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  const { userLocale, session } = data;

  // --------------------
  // sveltekit-i18n
  // --------------------
  await loadTranslations(userLocale, '/');

  return {
    userLocale,
    session
  };
};
