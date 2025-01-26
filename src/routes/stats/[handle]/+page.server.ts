import type { PageServerLoad } from './$types';

export const prerender = false; // 動的レンダリングにする

interface MetaData {
  displayName: string;
  ogTitle: string;
  ogImage: string;
  ogUrl: string;
}

export const load: PageServerLoad = async ({ params, fetch, url }) => {
  const handle = params.handle;

  // サーバからデータを取得
  const response = await fetch(`/stats/${handle}/ogp`);
  const data = await response.json();

  const displayName = data.profile.displayName;

  const ogTitle = displayName ? `${displayName}'s Blu-lyzer Result` : "Analyze Result";
  const ogImage = data.ogImage || "https://blu-lyzer.suibari.com/ogp.png";

  const ogUrl = url.origin + url.pathname;

  return {
    meta: {
      displayName,
      ogTitle,
      ogImage,
      ogUrl
    } as MetaData
  };
};
