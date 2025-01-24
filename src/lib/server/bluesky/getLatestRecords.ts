import { AtpAgent } from '@atproto/api';
import { getPdsDomain } from './getPdsDomain';

export type RecordMap = {
  posts: App.RecordExt[];
  likes: App.RecordExt[];
  repost: App.RecordExt[];
};

/**
 * Get the latest posts, likes, and reposts for a given handle
 * @param handle The Bluesky handle of the user
 * @returns Promise<RecordMap> Containing posts, likes, and reposts
 */
export async function getLatestRecords(handle: string, did: string, limit: number): Promise<RecordMap> {

  const pds = await getPdsDomain(did);
  const agent = new AtpAgent({ service: pds });

  const fetchRecords = async (collection: string, limit: number): Promise<App.RecordExt[]> => {
    try {
      let records: App.RecordExt[] = [];
      let cursor: string | undefined = undefined;

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

      return records;
    } catch (e) {
      console.error(e);
      console.warn(`[WARN] Failed to fetch records for ${collection}, handle: ${handle}`);
      return [];
    }
  };

  const [postRecords, likeRecords, repostRecords] = await Promise.all([
    fetchRecords('app.bsky.feed.post', limit),
    fetchRecords('app.bsky.feed.like', limit),
    fetchRecords('app.bsky.feed.repost', limit),
  ]);

  return {
    posts: postRecords,
    likes: likeRecords,
    repost: repostRecords,
  };
}
