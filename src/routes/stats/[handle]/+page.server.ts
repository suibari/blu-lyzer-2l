import { page } from '$app/state';

export async function load({ params, fetch }) {
  const handle = params.handle;

  // サーバからデータを取得
  const response = await fetch(`/stats/${handle}/ogp`);
  const data = await response.json();

  const displayName = data.profile.displayName;
  const avatar = data.profile.avatar;

  const ogTitle = displayName ? `${displayName}'s Blu-lyzer Result` : "Analyze Result";
  const ogImage = avatar || "";

  const ogUrl = page.url.pathname;

  return {
    meta: {
      displayName,
      ogTitle,
      ogImage,
      ogUrl
    }
  };
}
