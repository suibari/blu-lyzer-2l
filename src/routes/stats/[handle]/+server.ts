import { PUBLIC_NODE_ENV } from '$env/static/public';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { transformAppToDb, transformDbToApp } from '$lib/server/core/transformType';
import { getRecordsAndAnalyze, upsertRecords } from '$lib/server/inngest';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from '@sveltejs/kit';
import { inngest } from '$lib/server/inngest';

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
      if (isUpdatedWithinAnHour(data[0].updated_at) && PUBLIC_NODE_ENV !== "development") {
        console.log(`[INFO] skip background process: ${handle}`);
      } else {
        await inngest.send({name: "analyze/existing-user", data: {handle}});
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
        await inngest.send({name: "analyze/new-user", data: {handle, newResultAnalyze}});

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
