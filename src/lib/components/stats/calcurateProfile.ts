export function calculateInfluencer(followsCount: number | undefined, followersCount: number | undefined): number {
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
export function calculateMorningPerson(activityInterval: number[]): number {
  if (activityInterval.length !== 24) {
    throw new Error("activityInterval must contain exactly 24 elements.");
  }

  const morningSum = activityInterval.slice(0, 12).reduce((acc, curr) => acc + curr, 0); // 0時〜11時の合計
  const nightSum = activityInterval.slice(12, 24).reduce((acc, curr) => acc + curr, 0); // 12時〜23時の合計

  const total = morningSum + nightSum;
  if (total === 0) return 0; // アクティビティが全くない場合の処理

  return Math.round((morningSum / total) * 100);
}

/**
 * Night Owl スコアを計算する関数
 * @param activityInterval - 時間ごとのアクティビティデータ（24要素の配列）
 * @returns 夜型スコア (0~100)
 */
export function calculateNightPerson(activityInterval: number[]): number {
  if (activityInterval.length !== 24) {
    throw new Error("activityInterval must contain exactly 24 elements.");
  }

  const morningSum = activityInterval.slice(0, 12).reduce((acc, curr) => acc + curr, 0); // 0時〜11時の合計
  const nightSum = activityInterval.slice(12, 24).reduce((acc, curr) => acc + curr, 0); // 12時〜23時の合計

  const total = morningSum + nightSum;
  if (total === 0) return 0; // アクティビティが全くない場合の処理

  return Math.round((nightSum / total) * 100);
}

export function calculateSentimentTotal(sentimentHeatmap: number[]): number {
  if (sentimentHeatmap.length !== 24) {
    throw new Error("sentimentHeatmap must contain exactly 24 elements.");
  }

  const sentimentSum = sentimentHeatmap.reduce((acc, curr) => acc + curr, 0);
  const sentimentSumConv =  sentimentSum * 50 + 50;

  return (sentimentSumConv > 100) ? 100 : (sentimentSumConv < 0) ? 0 : sentimentSumConv;
}

export function calculatePercentileToPoint(percentile: number | null): number {
  return (percentile === null || percentile === 0) ? 0 : 100 - percentile;
}
