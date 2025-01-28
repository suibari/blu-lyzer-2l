import { getIronSession } from 'iron-session';
import { COOKIE_SECRET } from '$env/static/private';
import { SessionStore } from '$lib/server/bluesky/sessionStrage';

const sessionStore = new SessionStore();

/**
 * Handles the logout functionality by clearing the session without triggering a page redirect.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event - The request event object.
 */
export async function POST({ request }) {
  const response = new Response();

  try {
    // Retrieve the current session
    const clientSession: App.IronSessionBsky = await getIronSession(request, response, {
      cookieName: "oauth_session",
      password: COOKIE_SECRET,
    });

    if (clientSession.did) {
      // Delete session from the store
      await sessionStore.del(clientSession.did);

      // Clear session in the cookie
      clientSession.destroy();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': response.headers.get('set-cookie') || '',
      },
    });
  } catch (error) {
    console.error('Logout failed:', error);

    return new Response(JSON.stringify({ error: 'Failed to logout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
