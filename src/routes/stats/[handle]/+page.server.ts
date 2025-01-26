import type { PageServerLoad } from './$types';

export const prerender = false; // 動的レンダリングにする

export const load: PageServerLoad = async ({ params, fetch, url }) => {
  const handle = params.handle;

  // サーバからデータを取得
  const response = await fetch(`/stats/${handle}/ogp`);
  const data = await response.json();

  const displayName = data.profile.displayName;
  const avatar = data.profile.avatar;

  const ogTitle = displayName ? `${displayName}'s Blu-lyzer Result` : "Analyze Result";
  const ogImage = avatar || "";

  const ogUrl = url.origin + url.pathname;

  return {
    meta: {
      displayName,
      ogTitle,
      ogImage,
      ogUrl
    }
  };
};
