// src/hooks.server.ts
import { COOKIE_SECRET } from '$env/static/private';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { SessionStore } from '$lib/server/bluesky/sessionStrage';
import { sequence } from '@sveltejs/kit/hooks';
import { getIronSession } from 'iron-session';
const sessionStore = new SessionStore();
const sessionManager = SessionManager.getInstance();

export const handle = sequence(
  async ({ event, resolve }) => {
    // セッション更新
    await sessionManager.createOrRefreshSession();

    // -----------------------------
    // Accept-Languageヘッダーを取得
    // -----------------------------
    const acceptLanguage = event.request.headers.get('accept-language');
    const defaultLocale = 'en'; // デフォルトロケール（enにフォールバック）
    const supportedLocale = 'ja'; // サポートするのはjaのみ、それ以外はenにする

    let userLocale = defaultLocale; // 初期値としてenを設定

    if (acceptLanguage) {
      // Accept-Languageの中からロケールを抽出
      const locale = acceptLanguage.split(',')[0].split('-')[0]; // "en-US" -> "en"
      userLocale = locale === supportedLocale ? supportedLocale : defaultLocale;
    }

    // ロケールを locals に保存してクライアントへ渡す
    event.locals.userLocale = userLocale;

    // -----------------------------
    // セッションチェック
    // -----------------------------
    const response = new Response();

    const clientSession: App.IronSessionBsky = await getIronSession(event.request, response, {
      cookieName: 'oauth_session',
      password: COOKIE_SECRET,
    });

    if (clientSession.did) {
      const sessionData = await sessionStore.get(clientSession.did);

      if (!sessionData) {
        clientSession.destroy();
      } else {
        // session照合完了
        event.locals.session = sessionData;
        event.locals.did = clientSession.did;
      }
    } else {
      event.locals.session = null;
    }

    return resolve(event);
  }
);
