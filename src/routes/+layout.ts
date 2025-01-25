import { loadTranslations } from '../lib/translations/translations';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  const { userLocale } = data;

  // `translations` フォルダに `en.json` や `ja.json` を用意する
  await loadTranslations(userLocale, '/');

  return {
    userLocale
  };
};
