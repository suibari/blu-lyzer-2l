import { getNounFrequencies } from "./getNounFrequencies";
import { getWordFrequencyEn } from "./getWordFrequencyEn";

export async function analyzePosts(posts: App.RecordExt[]) {
  const combinedWordFreqMap: Record<string, App.wordFreq> = {};
  const sentimentHeatmap = new Array(24).fill(0);

  // jaとその他の言語に分ける
  const jaPosts: App.RecordExt[] = [];
  const otherPosts: App.RecordExt[] = [];

  for (const post of posts) {
    const langs = post.value.langs;

    if (langs && langs.length === 1 && langs[0] === "ja") {
      jaPosts.push(post);
    } else {
      otherPosts.push(post);
    }
  }

  // 1. ja以外の投稿を先に処理
  for (const post of otherPosts) {
    const { wordFreqMap, sentimentHeatmap: enHeatmap } = await getWordFrequencyEn([post]);

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

  // 2. jaの投稿をまとめて処理
  if (jaPosts.length > 0) {
    const { wordFreqMap, sentimentHeatmap: jaHeatmap } = await getNounFrequencies(jaPosts);

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
  }

  // wordFreqMapを出現回数でソート
  const sortedWordFreqMap = Object.values(combinedWordFreqMap).sort((a, b) => b.count - a.count);

  return { wordFreqMap: sortedWordFreqMap.slice(0, 100), sentimentHeatmap };
}
