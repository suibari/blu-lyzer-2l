import SessionManager from '$lib/server/bluesky/sessionManager';
import { transformAppToDb, transformDbToApp } from '$lib/server/core/transformType';
import { getRecordsAndAnalyze } from '$lib/server/inngest/functions';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from '@sveltejs/kit';

const sessionManager = SessionManager.getInstance();

export const GET: RequestHandler = async ({ params }) => {
  const { handle } = params;

  if (!handle) {
    return new Response(JSON.stringify({ error: 'Invalid Handle' }), { status: 400 });
  }

  console.log(`[INFO][OGP] receive handle: ${handle}`);

  try {
    // await sessionManager.createOrRefreshSession();
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
      .select('result_analyze, updated_at')
      .eq('handle', handle)
      .single();

    if (data) {
      // DBに存在: 既存ユーザ
      console.log(`[INFO] existing user: ${handle}`);

      return new Response(JSON.stringify({ profile }), { status: 200 });
    } else {
      // DBに存在しない: 新規ユーザ
      console.log(`[INFO][OGP] new user! : ${handle}`);

      return new Response(JSON.stringify({ profile }), { status: 200 });
    }

  } catch (err: any) {
    console.error(err);  // エラー詳細をログに記録
    // エラーメッセージに関する一貫性を保つ
    const message = err.message || 'An error occurred';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
