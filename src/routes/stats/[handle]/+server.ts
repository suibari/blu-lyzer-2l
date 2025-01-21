import { getLatestRecords } from '$lib/server/bluesky/getLatestRecords';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { analyzeRecords } from '$lib/server/core/analyzeRecords';
import { transformDbDataToAppStructure } from '$lib/server/core/transformDbDataToAppStructure';
import { supabase } from '$lib/server/supabase';
import type { ResultAnalyze } from '$types/api';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;

  if (handle) {
    const {data} = await supabase
      .from("records")
      .select('result_analyze')
      .eq('handle', handle);

    if (data) {
      // DBに存在: 既存ユーザ
      const resultAnalyze = transformDbDataToAppStructure(data[0].result_analyze);
      return new Response(JSON.stringify(resultAnalyze), { status: 200 });
    } else {
      // DBに存在しない: 新規ユーザ
      // 存在確認
      const agent = SessionManager.getInstance().getAgent();
      const {success} = await agent.getProfile({actor: handle});
      if (success) {
        // 取得解析処理
        const records = await getLatestRecords(handle);
        const newResultAnalyze = await analyzeRecords(records);
        return new Response(JSON.stringify(newResultAnalyze), { status: 200 });
      } else {
        // 存在しないユーザ
        return new Response(JSON.stringify({ error: 'User Not found' }), { status: 404 });
      }
    }

    // バックグラウンドで更新
    
  } else {
    return new Response(JSON.stringify({ error: 'User Not Specified' }), { status: 404 });
  }
}
