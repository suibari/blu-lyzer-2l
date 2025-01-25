import { toZonedTime } from 'date-fns-tz';  // タイムゾーン変換関数

export function shiftHeatmapInResultAnalyze(resultAnalyze: App.ResultAnalyze): App.ResultAnalyze {
  const shiftedResultAnalyze = resultAnalyze;

  const shiftedActionHeatmap = shiftHeatmap(resultAnalyze.activity.all.actionHeatmap);
  const shiftedPostHeatmap = shiftHeatmap(resultAnalyze.activity.post.actionHeatmap);
  const shiftedLikeHeatmap = shiftHeatmap(resultAnalyze.activity.like.actionHeatmap);
  const shiftedRepostHeatmap = shiftHeatmap(resultAnalyze.activity.repost.actionHeatmap);
  const shiftedSentimentHeatmap = shiftHeatmap(resultAnalyze.activity.post.sentimentHeatmap);

  shiftedResultAnalyze.activity.all.actionHeatmap = shiftedActionHeatmap;
  shiftedResultAnalyze.activity.post.actionHeatmap = shiftedPostHeatmap;
  shiftedResultAnalyze.activity.like.actionHeatmap = shiftedLikeHeatmap;
  shiftedResultAnalyze.activity.repost.actionHeatmap = shiftedRepostHeatmap;
  shiftedResultAnalyze.activity.post.sentimentHeatmap = shiftedSentimentHeatmap;

  return shiftedResultAnalyze;
}

function shiftHeatmap(heatmap: number[]): number[] {
  // ユーザーのタイムゾーンを取得
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // JST（Asia/Tokyo）タイムゾーンを基準にする
  const jstTimeZone = 'Asia/Tokyo';

  // UTCの現在時刻をユーザーのタイムゾーンに変換
  const now = new Date();

  // ユーザーのタイムゾーンでの時刻を取得
  const userZonedTime = toZonedTime(now, userTimeZone);
  // JSTの基準時間を取得
  const jstZonedTime = toZonedTime(now, jstTimeZone);

  // ユーザータイムゾーンとJSTの時差を計算
  const userOffset = jstZonedTime.getHours() - userZonedTime.getHours();

  // heatmap配列をシフトする（シフトがないように修正）
  const shiftedHeatmap = [
    ...heatmap.slice(userOffset), 
    ...heatmap.slice(0, userOffset)
  ];

  // ヒートマップのデータをユーザーのオフセットに従ってシフト
  return shiftedHeatmap;
}
