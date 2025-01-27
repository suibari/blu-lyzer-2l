// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  async ({ event, resolve }) => {
    // Accept-Languageヘッダーを取得
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

    return resolve(event);
  }
);
