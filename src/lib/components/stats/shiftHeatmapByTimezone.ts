import { toZonedTime } from 'date-fns-tz';  // タイムゾーン変換関数

export function shiftHeatmapInResultAnalyze(resultAnalyze: App.ResultAnalyze): App.ResultAnalyze {
  const shiftedResultAnalyze = resultAnalyze;

  shiftedResultAnalyze.activity.all.actionHeatmap = resultAnalyze.activity.all.actionHeatmap ? shiftHeatmap(resultAnalyze.activity.all.actionHeatmap) : null;
  shiftedResultAnalyze.activity.post.actionHeatmap = resultAnalyze.activity.post.actionHeatmap ? shiftHeatmap(resultAnalyze.activity.post.actionHeatmap) : null;
  shiftedResultAnalyze.activity.like.actionHeatmap = resultAnalyze.activity.like.actionHeatmap ? shiftHeatmap(resultAnalyze.activity.like.actionHeatmap) : null;
  shiftedResultAnalyze.activity.repost.actionHeatmap = resultAnalyze.activity.repost.actionHeatmap ? shiftHeatmap(resultAnalyze.activity.repost.actionHeatmap) : null;
  shiftedResultAnalyze.activity.post.sentimentHeatmap = resultAnalyze.activity.post.sentimentHeatmap ? shiftHeatmap(resultAnalyze.activity.post.sentimentHeatmap) : null;

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
