import { DB_API_URL, CF_CLIENT_ID, CF_CLIENT_SECRET } from '$env/static/private';

/**
 * PostgRESTへの共通リクエスト関数
 */
async function dbFetch<T = any>(path: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${DB_API_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set('CF-Access-Client-Id', CF_CLIENT_ID);
  headers.set('CF-Access-Client-Secret', CF_CLIENT_SECRET);
  headers.set('Content-Type', 'application/json');

  // Content-Profileヘッダーの設定: 必要
  const profile = headers.get('Accept-Profile');
  if (profile && !headers.has('Content-Profile')) {
    headers.set('Content-Profile', profile);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`DB API Error: ${response.statusText} (${response.status})`);
  }

  // 204 No Content（Update/Deleteなど）の場合はnullを返す
  if (response.status === 204 || response.status === 201) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const db = {
  // --- Records (for inngest/functions.ts and routes) ---

  getRecord: async (handle: string, columns: string = '*') => {
    // URLエンコードが必要な場合があるが、ハンドルは通常安全。
    // columnsはカンマ区切り。スペース除去してから渡すのが無難。
    const select = columns.replace(/\s/g, '');
    const result = await dbFetch<any[]>(`/records?handle=eq.${handle}&select=${select}`, {
      headers: { 'Accept-Profile': 'hirogaru' }
    });
    return (result && result.length > 0) ? result[0] : null;
  },

  getRecordsByHandles: async (handles: string[], columns: string = '*') => {
    if (handles.length === 0) return [];
    const val = `(${handles.join(',')})`;
    const select = columns.replace(/\s/g, '');
    const result = await dbFetch<any[]>(`/records?handle=in.${val}&select=${select}`, {
      headers: { 'Accept-Profile': 'hirogaru' }
    });
    return result || [];
  },

  upsertRecords: async (data: any) => {
    return await dbFetch('/records', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Prefer': 'resolution=merge-duplicates',
        'Accept-Profile': 'hirogaru'
      }
    });
  },

  rpc: async (functionName: string, params: any) => {
    return await dbFetch(`/rpc/${functionName}`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Accept-Profile': 'hirogaru'
      }
    });
  },

  // --- Tokens (for sessionManager.ts) ---

  getToken: async (handle: string) => {
    const result = await dbFetch<any[]>(`/tokens?handle=eq.${handle}`, {
      headers: { 'Accept-Profile': 'hirogaru' }
    });
    return (result && result.length > 0) ? result[0] : null;
  },

  upsertToken: async (handle: string, tokenData: any) => {
    return await dbFetch('/tokens', {
      method: 'POST',
      body: JSON.stringify({ handle, ...tokenData }),
      headers: {
        'Prefer': 'resolution=merge-duplicates',
        'Accept-Profile': 'hirogaru'
      }
    });
  },

  updateToken: async (handle: string, tokenData: any) => {
    return await dbFetch(`/tokens?handle=eq.${handle}`, {
      method: 'PATCH',
      body: JSON.stringify(tokenData),
      headers: { 'Accept-Profile': 'hirogaru' }
    });
  },

  // --- Auth Session (for sessionStrage.ts) ---

  getSession: async (key: string) => {
    const result = await dbFetch<any[]>(`/auth_session?key=eq.${key}`, {
      headers: { 'Accept-Profile': 'hirogaru' }
    });
    return (result && result.length > 0) ? result[0] : null;
  },

  upsertSession: async (key: string, session: string) => {
    return await dbFetch('/auth_session', {
      method: 'POST',
      body: JSON.stringify({ key, session, updated_at: new Date() }),
      headers: {
        'Prefer': 'resolution=merge-duplicates',
        'Accept-Profile': 'hirogaru'
      }
    });
  },

  deleteSession: async (key: string) => {
    return await dbFetch(`/auth_session?key=eq.${key}`, {
      method: 'DELETE',
      headers: {
        'Prefer': 'return=representation',
        'Accept-Profile': 'hirogaru'
      }
    });
  }
};
