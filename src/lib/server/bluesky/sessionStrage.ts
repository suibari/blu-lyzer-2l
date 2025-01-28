import type { NodeSavedSession, NodeSavedSessionStore, NodeSavedState, Session } from "@atproto/oauth-client-node";
import { supabase } from "../supabase";

export class StateStore {
  store: Map<string, NodeSavedState>;

  constructor() {
    this.store = new Map(); // Mapを使用
  }

  async get(key: string): Promise<NodeSavedState | undefined> {
    return this.store.get(key); // keyから値を取得
  }

  async set(key: string, val: NodeSavedState): Promise<void> {
    this.store.set(key, val); // keyに対して値を設定
  }

  async del(key: string): Promise<void> {
    this.store.delete(key); // keyのデータを削除
  }
}

export class SessionStore {
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const { data, error } = await supabase
      .from('auth_session')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) return undefined;

    return JSON.parse(data.session);
  }

  async set(key: string, val: NodeSavedSession): Promise<void> {
    const session = JSON.stringify(val);
    const { data, error } = await supabase
      .from('auth_session')
      .upsert({ key, session, updated_at: new Date() }, { onConflict: 'key' });

    if (error) {
      throw new Error(`Failed to set session: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    const { error } = await supabase
      .from('auth_session')
      .delete()
      .eq('key', key);

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }
}
