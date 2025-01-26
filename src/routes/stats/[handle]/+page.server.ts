import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, request }) => {
  const url = new URL(request.url); // ここで現在のリクエストのURLを取得
  const handle = params.handle;

  // サーバからデータを取得
  const response = await fetch(`/stats/${handle}/ogp`);
  const data = await response.json();

  const displayName = data.profile.displayName;
  const avatar = data.profile.avatar;

  const ogTitle = displayName ? `${displayName}'s Blu-lyzer Result` : "Analyze Result";
  const ogImage = avatar || "";

  const ogUrl = url.pathname;

  return {
    meta: {
      displayName,
      ogTitle,
      ogImage,
      ogUrl
    }
  };
};
