import { EXCLUDE_WORDS } from './config/excludeWords';
import type { wordFreq } from '$types/api';
import { fetchSentimentAnalysis } from './fetchAnalyzer';
import type { RecordExt } from '$types/atproto';

export async function getNounFrequencies(posts: RecordExt[]): Promise<{
  wordFreqMap: wordFreq[];
  sentimentHeatmap: number[];
}> {
  const wordFreqMap: wordFreq[] = [];
  const sentimentHeatmap = new Array(24).fill(0);

  const textsArray = posts.map(post => post.value.text || "");

  if (!textsArray.length) {
    console.log('[INFO] No valid text to analyze');
    return { wordFreqMap, sentimentHeatmap };
  }

  try {
    const { nouns_counts, average_sentiments } = await fetchSentimentAnalysis(textsArray);

    nouns_counts.forEach(({ noun, count, sentiment_sum }) => {
      if (!EXCLUDE_WORDS.includes(noun)) {
        wordFreqMap.push({ noun, count, sentimentScoreSum: sentiment_sum });
      }
    });

    const sentimentAccumulator: Record<number, { sum: number; count: number }> = {};
    posts.forEach((post, index) => {
      const createdAt = new Date(post.value.createdAt);
      const jstHour = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000).getUTCHours();

      sentimentAccumulator[jstHour] = sentimentAccumulator[jstHour] || { sum: 0, count: 0 };
      sentimentAccumulator[jstHour].sum += average_sentiments[index];
      sentimentAccumulator[jstHour].count += 1;
    });

    Object.entries(sentimentAccumulator).forEach(([hour, { sum, count }]) => {
      sentimentHeatmap[Number(hour)] = count > 0 ? sum / count : 0;
    });

  } catch (err) {
    console.warn('[WARN] Error in word analyze:', err);
  }

  return { wordFreqMap, sentimentHeatmap };
}
