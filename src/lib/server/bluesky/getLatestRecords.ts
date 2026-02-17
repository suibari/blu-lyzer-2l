import { AtpAgent } from '@atproto/api';
import { getPdsDomain } from './getPdsDomain';

export type RecordMap = {
  posts: App.RecordExt[];
  likes: App.RecordExt[];
  repost: App.RecordExt[];
};

export type FetchResult = {
  records: RecordMap;
  cursors: {
    posts?: string;
    likes?: string;
    reposts?: string;
  };
};

/**
 * Get the latest posts, likes, and reposts for a given handle
 * @param handle The Bluesky handle of the user
 * @returns Promise<FetchResult> Containing posts, likes, reposts, and their next cursors
 */
export async function getLatestRecords(
  handle: string,
  did: string,
  limit: number,
  cursors?: { posts?: string; likes?: string; reposts?: string }
): Promise<FetchResult> {

  const pds = await getPdsDomain(did);
  const agent = new AtpAgent({ service: pds });

  const fetchRecords = async (collection: string, limit: number, initialCursor?: string): Promise<{ records: App.RecordExt[], cursor?: string }> => {
    try {
      let records: App.RecordExt[] = [];
      let cursor: string | undefined = initialCursor;

      while (records.length < limit) {
        const response = await agent.com.atproto.repo.listRecords({
          repo: handle,
          collection,
          limit: Math.min(limit - records.length, 100), // 最大100件ずつ取得
          cursor,
        });

        if (response?.data?.records) {
          records = records.concat(response.data.records as App.RecordExt[]);
          cursor = response.data.cursor;

          // cursor が存在しない場合は、すべてのレコードを取得済みと判断
          if (!cursor) {
            break;
          }
        } else {
          break; // レスポンスが期待したデータでない場合はループ終了
        }
      }

      return { records, cursor };
    } catch (e) {
      console.error(e);
      console.warn(`[WARN] Failed to fetch records for ${collection}, handle: ${handle}`);
      return { records: [], cursor: undefined };
    }
  };

  const [postResult, likeResult, repostResult] = await Promise.all([
    fetchRecords('app.bsky.feed.post', limit, cursors?.posts),
    fetchRecords('app.bsky.feed.like', limit, cursors?.likes),
    fetchRecords('app.bsky.feed.repost', limit, cursors?.reposts),
  ]);

  return {
    records: {
      posts: postResult.records,
      likes: likeResult.records,
      repost: repostResult.records,
    },
    cursors: {
      posts: postResult.cursor,
      likes: likeResult.cursor,
      reposts: repostResult.cursor,
    }
  };
}
