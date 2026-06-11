import { PUBLIC_NODE_ENV } from '$env/static/public';
import SessionManager from '$lib/server/bluesky/sessionManager';
import { transformAppToDb, transformDbToApp } from '$lib/server/core/transformType';
import { getPercentilesForProperties, getRecordsAndAnalyze, upsertRecords } from '$lib/server/inngest/functions';
import { db } from '$lib/server/postgres';
import type { RequestHandler } from '@sveltejs/kit';
import { inngest } from '$lib/server/inngest';
import { calculateSummary } from '$lib/server/core/calcurateSummary';
import { shiftHeatmapInResultAnalyze } from '$lib/server/core/shiftHeatmapByTimezone';
import pkg from 'lodash';
const { merge } = pkg;

const sessionManager = SessionManager.getInstance();

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { handle } = params;
  const isBot = isBotUserAgent(request.headers.get('user-agent') ?? '');
  let configInvisible: App.ConfigInvisible = { allHeatmap: false, friendsHeatmap: false };

  if (!handle) {
    return new Response(JSON.stringify({ error: 'Invalid Handle' }), { status: 400 });
  }

  console.log(`[INFO] receive handle: ${handle}`);

  try {
    // await sessionManager.createOrRefreshSession();
    const agent = sessionManager.getAgent();

    // プロフィール取得の試行
    const { success, data: profile } = await agent.getProfile({ actor: handle });

    if (!success || !profile) {
      throw new Error('User Not found in Bluesky'); // Blueskyに存在しない場合
    }
    const did = profile.did;

    // アクセス判定
    if (locals.session && locals.did === did) {
      // 認証済みユーザ
      configInvisible.allHeatmap = false;
      configInvisible.friendsHeatmap = false;
    } else if (profile.labels?.find(label => label.val === "!no-unauthenticated")) {
      // 未認証Invisibleユーザ
      configInvisible.allHeatmap = true;
      configInvisible.friendsHeatmap = true;
    } else {
      // それ以外:未認証Visibleユーザ
      configInvisible.allHeatmap = false;
      configInvisible.friendsHeatmap = true;
    }

    // 既存ユーザ or 新規ユーザ
    // selectで必要なカラムを指定
    const data = await db.getRecord(handle, 'result_analyze, percentiles, updated_at');

    if (data) {
      // --------------------
      // DBに存在: 既存ユーザ
      // --------------------
      console.log(`[INFO] existing user: ${handle}`);
      let resultAnalyze = transformDbToApp(handle, data.result_analyze, data.updated_at);

      // タイムゾーン変換
      const { timeZone } = await request.json();
      const shiftedResultAnalyze = shiftHeatmapInResultAnalyze(resultAnalyze, timeZone);

      // サマリ取得
      const summary = calculateSummary(profile, shiftedResultAnalyze, data.percentiles);

      // friendsの分析
      await setResultAnalyzeFriends(shiftedResultAnalyze, timeZone);

      // バックグラウンド処理
      if (isUpdatedWithinAnHour(data.updated_at) && PUBLIC_NODE_ENV !== "development") {
        console.log(`[INFO] skip background process: ${handle}`);
      } else if (isBot) {
        console.log(`[INFO] skip background process for bot: ${handle}`);
      } else {
        await inngest.send({
          name: "analyze/existing-user",
          data: { handle, did }
        });
      }

      // BG処理開始後、データフィルタ処理
      filterResultAnalyze(shiftedResultAnalyze, configInvisible);

      return new Response(JSON.stringify({
        resultAnalyze: shiftedResultAnalyze,
        summary,
        percentiles: data.percentiles,
        profile,
        configInvisible,
      }), { status: 200 });

    } else {
      // --------------------
      // DBに存在しない: 新規ユーザ
      // --------------------
      console.log(`[INFO] new user! : ${handle}`);
      // const newResultAnalyze = await getRecordsAndAnalyze(handle, did, 100);

      // percentileがないのは見栄えが悪いので時間がかかっても取得
      const { percentiles, mergedResultAnalyze } = await doTmpUpsertAndGetPercentile(handle, did, null);

      // タイムゾーン変換
      const { timeZone } = await request.json();
      const shiftedResultAnalyze = shiftHeatmapInResultAnalyze(mergedResultAnalyze, timeZone);

      // サマリ取得
      const summary = calculateSummary(profile, shiftedResultAnalyze, percentiles);

      // friendsの分析
      await setResultAnalyzeFriends(shiftedResultAnalyze, timeZone);

      // friendsの分析
      await setResultAnalyzeFriends(shiftedResultAnalyze, timeZone);

      // バックグラウンド処理
      if (!isBot) {
        await inngest.send({
          name: "analyze/new-user",
          data: {
            handle,
            did,
            newResultAnalyze: shiftedResultAnalyze
          }
        });
      } else {
        console.log(`[INFO] skip background process for bot (new user): ${handle}`);
      }

      return new Response(JSON.stringify({
        resultAnalyze: shiftedResultAnalyze,
        summary,
        percentiles,
        profile,
        configInvisible,
      }), { status: 200 });
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

async function doTmpUpsertAndGetPercentile(handle: string, did: string, resultAnalyze: App.ResultAnalyze | null) {
  const tmpResultAnalyze = await getRecordsAndAnalyze(handle, did, 100);

  // 深くマージ（ネストされたオブジェクトも対象に）
  const mergedResultAnalyze = merge({}, tmpResultAnalyze, resultAnalyze);

  await upsertRecords(handle, mergedResultAnalyze, null);
  const percentiles = await getPercentilesForProperties(handle);

  return { percentiles, mergedResultAnalyze };
}

function filterResultAnalyze(resultAnalyze: App.ResultAnalyze, configInvisible: App.ConfigInvisible) {
  if (configInvisible.friendsHeatmap) {
    resultAnalyze.relationship?.forEach(friend => {
      friend.resultAnalyze = null;
    });
  }
  if (configInvisible.allHeatmap) {
    resultAnalyze.activity.all.actionHeatmap = null;
    resultAnalyze.activity.post.actionHeatmap = null;
    resultAnalyze.activity.post.sentimentHeatmap = null;
    resultAnalyze.activity.post.wordFreqMap = null;
    resultAnalyze.activity.like.actionHeatmap = null;
    resultAnalyze.activity.repost.actionHeatmap = null;
    resultAnalyze.relationship = null;
  }
}

/**
 * 自分のResultAnalyzeにFriendのResultAnalyzeをセット
 * @param resultAnalyze 
 * @param timeZone 
 */
const BOT_UA_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
  /baiduspider/i, /yandexbot/i, /applebot/i,
  /twitterbot/i, /discordbot/i, /telegrambot/i,
  /semrushbot/i, /ahrefsbot/i, /mj12bot/i,
];

function isBotUserAgent(ua: string): boolean {
  return BOT_UA_PATTERNS.some(p => p.test(ua));
}

async function setResultAnalyzeFriends(resultAnalyze: App.ResultAnalyze, timeZone: string) {
  const handleFriends = (resultAnalyze.relationship ?? [])
    .map(friend => friend.handle)
    .filter((h): h is string => !!h);

  const data = await db.getRecordsByHandles(handleFriends, 'result_analyze, percentiles, updated_at, handle');

  for (const friendDb of data || []) {
    const friend = resultAnalyze.relationship?.find(f => f.handle === friendDb.handle);
    if (friend?.handle) {
      const transformed = transformDbToApp(friend.handle, friendDb.result_analyze, friendDb.updated_at);
      friend.resultAnalyze = shiftHeatmapInResultAnalyze(transformed, timeZone);
    }
  }
}
