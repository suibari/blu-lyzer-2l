import SessionManager from '$lib/server/bluesky/sessionManager';
import { getResizedBase64Ogp } from '$lib/server/getResizedBase64Ogp';
import type { RequestHandler } from '@sveltejs/kit';

const sessionManager = SessionManager.getInstance();

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;
  let ogImage: string | undefined = undefined;

  if (!handle) {
    return new Response(JSON.stringify({ error: 'Invalid Handle' }), { status: 400 });
  }

  console.log(`[INFO][OGP] receive handle: ${handle}`);

  try {
    await sessionManager.createOrRefreshSession();
    const agent = sessionManager.getAgent();

    // プロフィール取得の試行
    const { success, data: profile } = await agent.getProfile({ actor: handle });

    if (!success || !profile) {
      throw new Error('User Not found in Bluesky'); // Blueskyに存在しない場合
    }

    // 画像
    if (profile.avatar) {
      ogImage = await getResizedBase64Ogp(profile.avatar);
    }

    return new Response(JSON.stringify({ profile, ogImage }), { status: 200 });

  } catch (err: any) {
    console.error(err);  // エラー詳細をログに記録
    // エラーメッセージに関する一貫性を保つ
    const message = err.message || 'An error occurred';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
