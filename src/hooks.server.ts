// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  async ({ event, resolve }) => {
    // Accept-Languageヘッダーを取得
    const acceptLanguage = event.request.headers.get('accept-language');
    const defaultLocale = 'en'; // デフォルトロケール
    const supportedLocales = ['en', 'ja']; // サポートしているロケール

    let userLocale = defaultLocale;

    if (acceptLanguage) {
      // Accept-Languageの中から最適なロケールを選択
      userLocale = acceptLanguage.split(',')[0].split('-')[0]; // "en-US" -> "en"
      if (!supportedLocales.includes(userLocale)) {
        userLocale = defaultLocale;
      }
    }

    // ロケールを locals に保存してクライアントへ渡す
    event.locals.userLocale = userLocale;

    return resolve(event);
  }
);
