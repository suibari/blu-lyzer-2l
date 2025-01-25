import type { RequestHandler } from '@sveltejs/kit';
import SessionManager from '../../../lib/server/bluesky/sessionManager';

const sessionManager = SessionManager.getInstance();
const agent = sessionManager.getAgent();

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  await sessionManager.createOrRefreshSession();
  const {data} = await agent.app.bsky.actor.searchActorsTypeahead({q});

  return new Response(JSON.stringify(data.actors.slice(0, 5)), { status: 200 }); // 5件のみ返す
};
