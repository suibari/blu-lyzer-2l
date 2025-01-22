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

    if (data) {
      // DBに存在: 既存ユーザ
      const resultAnalyze = transformDbToApp(data[0].result_analyze, data[0].updated_at);

      // バックグラウンド処理
      queueMicrotask(async () => {
        const newResultAnalyze = await getRecordsAndAnalyze(handle);
        await upsertRecords(handle, newResultAnalyze);
      });

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
          await upsertRecords(handle, newResultAnalyze);
        });

        return new Response(JSON.stringify(newResultAnalyze), { status: 200 });
      } else {
        // Bskyに存在しないユーザ
        return new Response(JSON.stringify({ error: 'User Not found' }), { status: 404 });
      }
    }
  } else {
    return new Response(JSON.stringify({ error: 'User Not Specified' }), { status: 404 });
  }
}

async function getRecordsAndAnalyze (handle: string): Promise<ResultAnalyze> {
  const records = await getLatestRecords(handle);
  const resultAnalyze = await analyzeRecords(records);
  console.log(`[INFO] get result_analyze for ${handle}`);
  return resultAnalyze;
}

async function upsertRecords (handle: string, resultAnalyze: ResultAnalyze) {
  await supabase
    .from("records")
    .upsert([{ handle, result_analyze: transformAppToDb(resultAnalyze) }]);
  console.log(`[INFO] updated result_analyze for ${handle}`);
}
