import { PUBLIC_URL } from '$env/static/public';
import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { SessionStore, StateStore } from './sessionStrage';

let client: NodeOAuthClient;

export const createClient = async () => {
  const url = PUBLIC_URL || `http://127.0.0.1:5173`;
  const enc = encodeURIComponent;

  if (!client) {
    client = new NodeOAuthClient({
      clientMetadata: {
        client_id: PUBLIC_URL ?
          `${url}/client-metadata.json` :
          `http://localhost?redirect_uri=${enc(`${url}/api/callback`)}&scope=${enc('atproto transition:generic')}`,
        client_name: 'Blu-lyzer',
        client_uri: url,
        redirect_uris: [`${url}/api/callback`],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        application_type: 'web',
        token_endpoint_auth_method: 'none',
        dpop_bound_access_tokens: true,
        scope: 'atproto transition:generic',
      },
    
      stateStore: new StateStore(),
      sessionStore: new SessionStore(),
    
      // requestLock の実装も確認
      requestLock: async (key, fn) => {
        return await fn();
      },
    });   
  }

  return client;
}