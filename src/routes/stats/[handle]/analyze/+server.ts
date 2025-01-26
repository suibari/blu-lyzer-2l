import { PUBLIC_NODE_ENV } from '$env/static/public';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { transformAppToDb, transformDbToApp } from '$lib/server/core/transformType';
import { getPercentilesForProperties, getRecordsAndAnalyze, propertyNames, upsertRecords } from '$lib/server/inngest/functions';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from '@sveltejs/kit';
import { inngest } from '$lib/server/inngest';

const sessionManager = SessionManager.getInstance();

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;

  if (!handle) {
    return new Response(JSON.stringify({ error: 'Invalid Handle' }), { status: 400 });
  }

  console.log(`[INFO] receive handle: ${handle}`);

  try {
    await sessionManager.createOrRefreshSession();
    const agent = sessionManager.getAgent();

    // プロフィール取得の試行
    const { success, data: profile } = await agent.getProfile({ actor: handle });

    if (!success || !profile) {
      throw new Error('User Not found in Bluesky'); // Blueskyに存在しない場合
    }
    const did = profile.did;

    // 既存ユーザ or 新規ユーザ
    const { data } = await supabase
      .from("records")
      .select('result_analyze, percentiles, updated_at')
      .eq('handle', handle)
      .single();

    if (data) {
      // DBに存在: 既存ユーザ
      console.log(`[INFO] existing user: ${handle}`);
      const resultAnalyze = transformDbToApp(data.result_analyze, data.updated_at);

      // percentileがなかったら、反映まで2回更新が必要なのでここで表示させる
      if (!data.percentiles) {
        data.percentiles = await doTmpUpsertAndGetPercentile(handle, did);
      }

      // バックグラウンド処理
      if (isUpdatedWithinAnHour(data.updated_at) && PUBLIC_NODE_ENV !== "development") {
        console.log(`[INFO] skip background process: ${handle}`);
      } else {
        await inngest.send({ name: "analyze/existing-user", data: { handle, did } });
      }

      return new Response(JSON.stringify({ resultAnalyze, percentiles: data.percentiles, profile }), { status: 200 });
    } else {
      // DBに存在しない: 新規ユーザ
      console.log(`[INFO] new user! : ${handle}`);
      const newResultAnalyze = await getRecordsAndAnalyze(handle, did, 100);

      // percentileがないのは見栄えが悪いので時間がかかっても取得
      const percentiles = await doTmpUpsertAndGetPercentile(handle, did);

      // バックグラウンド処理
      await inngest.send({ name: "analyze/new-user", data: { handle, newResultAnalyze } });

      return new Response(JSON.stringify({ resultAnalyze: newResultAnalyze, percentiles, profile }), { status: 200 });
    }

  } catch (err: any) {
    console.error(err);  // エラー詳細をログに記録
    // エラーメッセージに関する一貫性を保つ
    const message = err.message || 'An error occurred';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
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

async function doTmpUpsertAndGetPercentile(handle: string, did: string) {
  const tmpResultAnalyze = await getRecordsAndAnalyze(handle, did, 100);
  await upsertRecords(handle, tmpResultAnalyze, null);
  const percentiles = await getPercentilesForProperties(handle, propertyNames);

  return percentiles;
}