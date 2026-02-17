import type { NodeSavedSession, NodeSavedSessionStore, NodeSavedState, Session } from "@atproto/oauth-client-node";
import { db } from "../postgres";

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
    try {
      const data = await db.getSession(key);
      if (!data) return undefined;
      return JSON.parse(data.session);
    } catch (error) {
      return undefined;
    }
  }

  async set(key: string, val: NodeSavedSession): Promise<void> {
    const session = JSON.stringify(val);
    try {
      await db.upsertSession(key, session);
    } catch (error: any) {
      throw new Error(`Failed to set session: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await db.deleteSession(key);
    } catch (error: any) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }
}
