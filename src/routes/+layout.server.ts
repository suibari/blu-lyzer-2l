import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    userLocale: locals.userLocale, // hooks.server.ts から渡されたロケール
    session: locals.session, // hooks.server.tsから渡されたセッション
    did: locals.did,
  };
};
