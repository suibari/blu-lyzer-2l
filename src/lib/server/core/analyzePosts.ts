import { getNounFrequencies } from "./getNounFrequencies";
import { getWordFrequencyEn } from "./getWordFrequencyEn";

export async function analyzePosts(posts: App.RecordExt[]) {
  const combinedWordFreqMap: Record<string, App.WordFreq> = {};
  const sentimentHeatmap = new Array(24).fill(0);
  let sentimentHistory: Array<{ date: string, score: number }> = [];

  // jaポストが一つでも含まれているか確認
  const hasJaPost = posts.some(post => post.value.langs?.includes("ja"));

  if (hasJaPost) {
    console.log(`[INFO][analyzePosts] Mode: JA (API) - ${posts.length} posts`);
    // 日本語ポストが含まれている場合はgetNounFrequenciesを使う
    const { wordFreqMap, sentimentHeatmap: jaHeatmap, sentimentHistory: jaHistory } = await getNounFrequencies(posts);
    sentimentHistory = jaHistory;

    // wordFreqMapのマージ
    wordFreqMap.forEach(({ noun, count, sentimentScoreSum }) => {
      if (!combinedWordFreqMap[noun]) {
        combinedWordFreqMap[noun] = { noun, count, sentimentScoreSum };
      } else {
        combinedWordFreqMap[noun].count += count;
        combinedWordFreqMap[noun].sentimentScoreSum += sentimentScoreSum;
      }
    });

    // sentimentHeatmapの加算
    jaHeatmap.forEach((value, index) => {
      sentimentHeatmap[index] += value;
    });
  } else {
    console.log(`[INFO][analyzePosts] Mode: EN (Local) - ${posts.length} posts`);
    // 日本語ポストが含まれていない場合はgetWordFrequencyEnを使う
    const { wordFreqMap, sentimentHeatmap: enHeatmap, sentimentHistory: enHistory } = await getWordFrequencyEn(posts);
    sentimentHistory = enHistory;

    // wordFreqMapのマージ
    wordFreqMap.forEach(({ noun, count, sentimentScoreSum }) => {
      if (!combinedWordFreqMap[noun]) {
        combinedWordFreqMap[noun] = { noun, count, sentimentScoreSum };
      } else {
        combinedWordFreqMap[noun].count += count;
        combinedWordFreqMap[noun].sentimentScoreSum += sentimentScoreSum;
      }
    });

    // sentimentHeatmapの加算
    enHeatmap.forEach((value, index) => {
      sentimentHeatmap[index] += value;
    });
  }

  // wordFreqMapを出現回数でソート
  const sortedWordFreqMap = Object.values(combinedWordFreqMap).sort((a, b) => b.count - a.count);

  // sentimentHistoryを日付の降順でソート
  sentimentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { wordFreqMap: sortedWordFreqMap, sentimentHeatmap, sentimentHistory };
}
