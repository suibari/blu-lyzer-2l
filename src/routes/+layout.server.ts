import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    userLocale: locals.userLocale // hooks.server.ts から渡されたロケール
  };
};
