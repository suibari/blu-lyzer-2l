import { updated } from '$app/state';
import { getLatestRecords } from '$lib/server/bluesky/getLatestRecords';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { analyzeRecords } from '$lib/server/core/analyzeRecords';
import { transformAppToDb, transformDbToApp } from '$lib/server/core/transformType';
import { supabase } from '$lib/server/supabase';
import type { ResultAnalyze, ResultAnalyzeDB } from '$types/api';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;

  if (handle) {
    const {data} = await supabase
      .from("records")
      .select('result_analyze, updated_at')
      .eq('handle', handle);

    if (data && data[0]) {
      // DBに存在: 既存ユーザ
      const resultAnalyze = transformDbToApp(data[0].result_analyze, data[0].updated_at);

      // バックグラウンド処理
      if (isUpdatedWithinAnHour(data[0].updated_at)) {
        console.log(`[INFO] skip background process: ${handle}`);
      } else {
        queueMicrotask(async () => {
          console.log(`[INFO] start background process: ${handle}`);
          const newResultAnalyze = await getRecordsAndAnalyze(handle);
          await upsertRecords(handle, newResultAnalyze);
        });
      }

      return new Response(JSON.stringify(resultAnalyze), { status: 200 });
    } else {
      // DBに存在しない: 新規ユーザ
      // 存在確認
      const agent = SessionManager.getInstance().getAgent();
      const {success} = await agent.getProfile({actor: handle});
      if (success) {
        // 取得解析処理
        const newResultAnalyze = await getRecordsAndAnalyze(handle);

        // バックグラウンド処理
        queueMicrotask(async () => {
          console.log(`[INFO] start background process: ${handle}`)
          await upsertRecords(handle, newResultAnalyze);
        });

        return new Response(JSON.stringify(newResultAnalyze), { status: 200 });
      } else {
        // Bskyに存在しないユーザ
        return new Response(JSON.stringify({ error: 'User Not found in Bluesky' }), { status: 404 });
      }
    }
  } else {
    return new Response(JSON.stringify({ error: 'Invalid Handle' }), { status: 404 });
  }
}

async function getRecordsAndAnalyze (handle: string): Promise<ResultAnalyze> {
  const records = await getLatestRecords(handle);
  const resultAnalyze = await analyzeRecords(records);
  console.log(`[INFO] get result_analyze: ${handle}`);
  return resultAnalyze;
}

async function upsertRecords (handle: string, resultAnalyze: ResultAnalyze) {
  await supabase
    .from("records")
    .upsert([{
      handle,
      result_analyze: transformAppToDb(resultAnalyze),
      updated_at: new Date().toISOString(),
    }]);
  console.log(`[INFO] updated result_analyze: ${handle}`);
}

/**
 * 更新日時が1時間以内かどうかをチェックする
 * @param updatedAt 更新日時（ISO文字列またはDateオブジェクト）
 * @returns 更新が1時間以内ならtrue、それ以外はfalse
 */
function isUpdatedWithinAnHour(updatedAt: string | Date): boolean {
  const updatedTimeUTC = new Date(updatedAt).getTime(); // UTCタイムスタンプ
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return updatedTimeUTC >= oneHourAgo;
}
