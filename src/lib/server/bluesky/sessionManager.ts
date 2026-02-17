import { BSKY_IDENTIFIER, BSKY_APP_PASSWORD } from '$env/static/private';
import { AtpAgent } from '@atproto/api';
import { db } from '../postgres';

// Bluesky セッション管理クラス
export default class SessionManager {
  private static instance: SessionManager;
  private agent: AtpAgent;
  private identifier: string;
  private password: string;

  constructor() {
    this.agent = new AtpAgent({ service: 'https://bsky.social' });
    this.identifier = BSKY_IDENTIFIER;
    this.password = BSKY_APP_PASSWORD;
  }

  static getInstance(): SessionManager {
    if (!this.instance) {
      this.instance = new SessionManager();
    }
    return this.instance;
  }

  async createOrRefreshSession(): Promise<void> {
    // DBからトークンを取得
    let data;
    try {
      data = await db.getToken(this.identifier);
    } catch (error: any) {
      console.warn(`[WARN] Error retrieving session for ${this.identifier}:`, error.message);
    }

    if (!data || !data.access_jwt) {
      console.info(`[INFO] No valid session found. Creating a new session for ${this.identifier}.`);
      await this.createSession(); // 新しいセッションを作成
      return;
    }

    const accessJwt = data.access_jwt;

    // セッションを設定
    this.agent.setHeader('Authorization', `Bearer ${accessJwt}`);

    try {
      // トークンの有効性を確認
      await this.agent.app.bsky.feed.getTimeline();
    } catch (err: any) {
      // 有効期限切れならセッションを更新、それ以外はエラーをスロー
      if (err.error === 'ExpiredToken') {
        console.info(`[INFO] Token expired. Refreshing session for ${this.identifier}.`);
        await this.refreshSession();
      } else {
        console.error(`[ERROR] Error validating session for ${this.identifier}:`, err.message);
        throw err;
      }
    }
  }

  private async createSession(): Promise<void> {
    const response = await this.agent.login({
      identifier: this.identifier,
      password: this.password,
    });

    await db.upsertToken(this.identifier, { access_jwt: response.data.accessJwt });

    this.agent.setHeader('Authorization', `Bearer ${response.data.accessJwt}`);
    console.info('[INFO] Created a new session.');
  }

  private async refreshSession(): Promise<void> {
    const response = await this.agent.login({
      identifier: this.identifier,
      password: this.password,
    });

    await db.updateToken(this.identifier, { access_jwt: response.data.accessJwt });

    this.agent.setHeader('Authorization', `Bearer ${response.data.accessJwt}`);
    console.info('[INFO] Refreshed the session.');
  }

  /**
   * AtpAgentのインスタンスを返す
   * @returns 
   */
  getAgent(): AtpAgent {
    return this.agent;
  }
}
