import { getIronSession, type IronSession } from 'iron-session';
import { COOKIE_SECRET } from '$env/static/private'; // 環境変数をインポート
import { createClient } from '$lib/server/bluesky/sessionManagerOAuth'; // OAuthクライアントをインポート
const client = await createClient();

export async function GET({ url, request }) {
  const response = new Response();
  const params = new URLSearchParams(url.search); // URLからクエリパラメータを取得
  try {
    const { session } = await client.callback(params); // OAuthのコールバック処理

    // セッション管理
    const clientSession: App.IronSessionBsky = await getIronSession(request, response, {
      cookieName: "oauth_session",
      password: COOKIE_SECRET,
    });

    if (clientSession.did && clientSession.did !== session.sub) {
      throw new Error('session already exists for another user');
    }
    
    clientSession.did = session.sub; // セッションにdidを保存
    await clientSession.save(); // セッションを保存

    const cokkie = response.headers.get('set-cookie') || "";
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': cokkie // セッション情報を含むクッキーをレスポンスに設定
      }
    });

  } catch (err) {
    console.error('OAuth callback failed:', err); // エラーログ

    // エラー時のリダイレクト
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/?error=oauth_failed'
      }
    });
  }
}
