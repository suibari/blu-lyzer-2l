import { BSKY_IDENTIFIER, BSKY_APP_PASSWORD } from '$env/static/private';
import { AtpAgent } from '@atproto/api';
import { supabase } from '../supabase';

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
    // Supabase からトークンを取得
    const { data, error } = await supabase
      .from('tokens')
      .select('access_jwt')
      .eq('handle', this.identifier)
      .single();

    if (error || !data) {
      console.warn(`[WARN] No existing session found. Creating a new session for ${this.identifier}.`);
      await this.createSession();
    } else {
      const accessJwt = data.access_jwt;
      this.agent.setHeader('Authorization', `Bearer ${accessJwt}`);
      
      // セッション確認
      try {
        await this.agent.app.bsky.feed.getTimeline();
      } catch (err: any) {
        if (err.error === 'ExpiredToken') {
          console.info('[INFO] Session expired. Refreshing session.');
          await this.refreshSession();
        } else {
          throw new Error(`[ERROR] Failed to validate session: ${err.message}`);
        }
      }
    }
  }

  private async createSession(): Promise<void> {
    const response = await this.agent.login({
      identifier: this.identifier,
      password: this.password,
    });

    await supabase
      .from('tokens')
      .upsert({ handle: this.identifier, access_jwt: response.data.accessJwt })
      .eq('handle', this.identifier);

    this.agent.setHeader('Authorization', `Bearer ${response.data.accessJwt}`);
    console.info('[INFO] Created a new session.');
  }

  private async refreshSession(): Promise<void> {
    const response = await this.agent.login({
      identifier: this.identifier,
      password: this.password,
    });

    await supabase
      .from('tokens')
      .update({ access_jwt: response.data.accessJwt })
      .eq('handle', this.identifier);

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
