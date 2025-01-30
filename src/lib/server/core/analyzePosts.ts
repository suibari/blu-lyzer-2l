import { getNounFrequencies } from "./getNounFrequencies";
import { getWordFrequencyEn } from "./getWordFrequencyEn";

export async function analyzePosts(posts: App.RecordExt[]) {
  const combinedWordFreqMap: Record<string, App.WordFreq> = {};
  const sentimentHeatmap = new Array(24).fill(0);

  // jaポストが一つでも含まれているか確認
  const hasJaPost = posts.some(post => post.value.langs && post.value.langs.length === 1 && post.value.langs[0] === "ja");

  if (hasJaPost) {
    // 日本語ポストが含まれている場合はgetNounFrequenciesを使う
    const { wordFreqMap, sentimentHeatmap: jaHeatmap } = await getNounFrequencies(posts);

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
    // 日本語ポストが含まれていない場合はgetWordFrequencyEnを使う
    const { wordFreqMap, sentimentHeatmap: enHeatmap } = await getWordFrequencyEn(posts);

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

  return { wordFreqMap: sortedWordFreqMap.slice(0, 100), sentimentHeatmap };
}
