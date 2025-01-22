import type { RecordExt } from '$types/atproto';
import SessionManager from './sessionManager';

export type RecordMap = {
  posts: RecordExt[];
  likes: RecordExt[];
  repost: RecordExt[];
};

const sessionManager = SessionManager.getInstance();

/**
 * Get the latest posts, likes, and reposts for a given handle
 * @param handle The Bluesky handle of the user
 * @returns Promise<RecordMap> Containing posts, likes, and reposts
 */
export async function getLatestRecords(handle: string): Promise<RecordMap> {
  await sessionManager.createOrRefreshSession();

  const agent = sessionManager.getAgent();

  const fetchRecords = async (collection: string): Promise<RecordExt[]> => {
    try {
      const response = await agent.com.atproto.repo.listRecords({
        repo: handle,
        collection,
        limit: 100,
      });

      const records = response?.data?.records;
      if (Array.isArray(records)) {
        return records as RecordExt[]; // 型アサーション
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      console.warn(`[WARN] Failed to fetch records for ${collection}, handle: ${handle}`);
      return [];
    }
  };

  const [postRecords, likeRecords, repostRecords] = await Promise.all([
    fetchRecords('app.bsky.feed.post'),
    fetchRecords('app.bsky.feed.like'),
    fetchRecords('app.bsky.feed.repost'),
  ]);

  return {
    posts: postRecords,
    likes: likeRecords,
    repost: repostRecords,
  };
}
