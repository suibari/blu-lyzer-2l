import { toZonedTime } from 'date-fns-tz';  // タイムゾーン変換関数

export function shiftHeatmapInResultAnalyze(resultAnalyze: App.ResultAnalyze, userTimeZone: string): App.ResultAnalyze {
  // 元のオブジェクトを壊さないために新しいオブジェクトを作成
  const shiftedResultAnalyze: App.ResultAnalyze = JSON.parse(JSON.stringify(resultAnalyze));

  // 各プロパティを非破壊的に更新
  shiftedResultAnalyze.activity.all.actionHeatmap = resultAnalyze.activity.all.actionHeatmap
    ? shiftHeatmap(resultAnalyze.activity.all.actionHeatmap, userTimeZone)
    : null;

  shiftedResultAnalyze.activity.post.actionHeatmap = resultAnalyze.activity.post.actionHeatmap
    ? shiftHeatmap(resultAnalyze.activity.post.actionHeatmap, userTimeZone)
    : null;

  shiftedResultAnalyze.activity.like.actionHeatmap = resultAnalyze.activity.like.actionHeatmap
    ? shiftHeatmap(resultAnalyze.activity.like.actionHeatmap, userTimeZone)
    : null;

  shiftedResultAnalyze.activity.repost.actionHeatmap = resultAnalyze.activity.repost.actionHeatmap
    ? shiftHeatmap(resultAnalyze.activity.repost.actionHeatmap, userTimeZone)
    : null;

  shiftedResultAnalyze.activity.post.sentimentHeatmap = resultAnalyze.activity.post.sentimentHeatmap
    ? shiftHeatmap(resultAnalyze.activity.post.sentimentHeatmap, userTimeZone)
    : null;

  shiftedResultAnalyze.activity.post.reply.actionHeatmap = resultAnalyze.activity.post.reply.actionHeatmap
    ? shiftHeatmap(resultAnalyze.activity.post.reply.actionHeatmap, userTimeZone)
    : null;

  return shiftedResultAnalyze;
}

function shiftHeatmap(heatmap: number[], userTimeZone: string): number[] {
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
