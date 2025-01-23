import { PUBLIC_NODE_ENV } from '$env/static/public';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { transformAppToDb, transformDbToApp } from '$lib/server/core/transformType';
import { getRecordsAndAnalyze, upsertRecords } from '$lib/server/inngest';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from '@sveltejs/kit';
import { inngest } from '$lib/server/inngest';

const propertyNames = [
  "averageInterval",
  "averagePostInterval",
  "averageLikeInterval",
  "averageRepostInterval",
  "averageTextLength",
];

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;
  let errMessage = "";

  if (handle) {
    const {data} = await supabase
      .from("records")
      .select('result_analyze, updated_at')
      .eq('handle', handle)
      .single();

    if (data) {
      // DBに存在: 既存ユーザ
      const resultAnalyze = transformDbToApp(data.result_analyze, data.updated_at);
      const percentiles = await getPercentilesForProperties(handle, propertyNames);
      console.log(percentiles)

      // バックグラウンド処理
      if (isUpdatedWithinAnHour(data.updated_at) && PUBLIC_NODE_ENV !== "development") {
        console.log(`[INFO] skip background process: ${handle}`);
      } else {
        await inngest.send({name: "analyze/existing-user", data: {handle}});
      }

      return new Response(JSON.stringify({resultAnalyze, percentiles}), { status: 200 });
    } else {
      // DBに存在しない: 新規ユーザ
      // 存在確認
      const agent = SessionManager.getInstance().getAgent();
      const {success} = await agent.getProfile({actor: handle});
      if (success) {
        // 取得解析処理
        const newResultAnalyze = await getRecordsAndAnalyze(handle);
        const percentiles = await getPercentilesForProperties(handle, propertyNames);

        // バックグラウンド処理
        await inngest.send({name: "analyze/new-user", data: {handle, newResultAnalyze}});

        return new Response(JSON.stringify({resultAnalyze: newResultAnalyze, percentiles}), { status: 200 });
      } else {
        // Bskyに存在しないユーザ
        errMessage = 'User Not found in Bluesky'
      }
    }
  } else {
    // ハンドルが無効
    errMessage = 'Invalid Handle';
  }

  return new Response(JSON.stringify({ error: errMessage }), { status: 500 });
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

/**
 * 複数のプロパティのパーセンタイルを順次取得
 * @param handle 対象のハンドル
 * @param propertyNames 複数のプロパティ名
 * @returns 各プロパティのパーセンタイルと値を含むオブジェクト
 */
async function getPercentilesForProperties(handle: string, propertyNames: string[]) {
  const percentiles: Record<string, { value: number; rank: number } | null> = {};

  // 各プロパティ名について順次RPCを実行
  for (const propertyName of propertyNames) {
    const { data, error } = await supabase.rpc('get_json_property_percentile', {
      target_handle: handle,
      property_name: propertyName,
    });

    if (error) {
      console.error(`Error fetching percentile for property: ${propertyName}`, error);
      percentiles[propertyName] = null;  // エラーが発生した場合はnullを設定
      continue;
    }

    if (data) {
      percentiles[propertyName] = data;
    } else {
      percentiles[propertyName] = null;  // データがなければnullを設定
    }
  }

  return percentiles;
}
