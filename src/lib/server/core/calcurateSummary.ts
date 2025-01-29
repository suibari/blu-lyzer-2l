import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

export function calculateSummary(profile: ProfileViewDetailed, resultAnalyze: App.ResultAnalyze, percentiles: App.Percentiles): App.Summary {
  return {
    influencer: calculateInfluencer(profile.followsCount, profile.followersCount),
    morningPerson: calculateMorningPerson(resultAnalyze.activity.all.actionHeatmap || Array(24)),
    nightOwl: calculateNightPerson(resultAnalyze.activity.all.actionHeatmap || Array(24)),
    positivity: calculateSentimentTotal(resultAnalyze.activity.post.sentimentHeatmap || Array(24)),
    postingFreq: calculatePercentileToPoint(percentiles.averagePostsInterval),
    likingFreq: calculatePercentileToPoint(percentiles.averageLikeInterval || 0),
    repostFreq: calculatePercentileToPoint(percentiles.averageRepostInterval || 0),
    longpostFreq: calculatePercentileToPoint(percentiles.averageTextLength),
    replyFreq: calculatePercentileToPoint(percentiles.averageReplyInterval),
  }
}

const HOUR_START_MORNING = 4;
const HOUR_START_NIGHT = 13;
const HOUR_END_NIGHT = 22;

function calculateInfluencer(followsCount: number | undefined, followersCount: number | undefined): number {
  const follows = followsCount ? followsCount : 0;
  const followers = followersCount ? followersCount : 0;

  // フォロワー数とフォロー数の比率を計算
  const ratioBias = (followers / (follows + 1));

  // フォロワー数のスケールに基づくバイアス（logスケールで調整）
  const followerBias = Math.log10(followers + 1) * 8; // +1で0フォロワー時の対数回避

  // スコアを50を基準に計算し、比率とフォロワーバイアスを組み合わせ
  const influence = (ratioBias ) + (followerBias);

  // 最小0、最大100に制限
  return Math.min(Math.max(influence, 0), 100);
}

/**
 * Morning Person スコアを計算する関数
 * @param activityInterval - 時間ごとのアクティビティデータ（24要素の配列）
 * @returns 朝型スコア (0~100)
 */
function calculateMorningPerson(activityInterval: number[]): number {
  if (activityInterval.length !== 24) {
    throw new Error("activityInterval must contain exactly 24 elements.");
  }

  const morningSum = activityInterval.slice(HOUR_START_MORNING, HOUR_START_NIGHT).reduce((acc, curr) => acc + curr, 0);
  const nightSum = activityInterval.slice(HOUR_START_NIGHT, HOUR_END_NIGHT).reduce((acc, curr) => acc + curr, 0);

  const total = morningSum + nightSum;
  if (total === 0) return 0; // アクティビティが全くない場合の処理

  return Math.round((morningSum / total) * 100);
}

/**
 * Night Owl スコアを計算する関数
 * @param activityInterval - 時間ごとのアクティビティデータ（24要素の配列）
 * @returns 夜型スコア (0~100)
 */
function calculateNightPerson(activityInterval: number[]): number {
  if (activityInterval.length !== 24) {
    throw new Error("activityInterval must contain exactly 24 elements.");
  }

  const morningSum = activityInterval.slice(HOUR_START_MORNING, HOUR_START_NIGHT).reduce((acc, curr) => acc + curr, 0);
  const nightSum = activityInterval.slice(HOUR_START_NIGHT, HOUR_END_NIGHT).reduce((acc, curr) => acc + curr, 0);

  const total = morningSum + nightSum;
  if (total === 0) return 0; // アクティビティが全くない場合の処理

  return Math.round((nightSum / total) * 100);
}

function calculateSentimentTotal(sentimentHeatmap: number[]): number {
  if (sentimentHeatmap.length !== 24) {
    throw new Error("sentimentHeatmap must contain exactly 24 elements.");
  }

  const sentimentSum = sentimentHeatmap.reduce((acc, curr) => acc + curr, 0);
  const sentimentSumConv =  sentimentSum * 50 + 50;

  return (sentimentSumConv > 100) ? 100 : (sentimentSumConv < 0) ? 0 : sentimentSumConv;
}

function calculatePercentileToPoint(percentile: number | null): number {
  return (percentile === null || percentile === 0) ? 0 : 100 - percentile;
}
