import { EXCLUDE_WORDS, MIN_WORD_COUNT, MIN_WORD_LENGTH } from './config/excludeWords';
import { fetchSentimentAnalysis } from './fetchAnalyzer';

export async function getNounFrequencies(posts: App.RecordExt[]): Promise<{
  wordFreqMap: App.wordFreq[];
  sentimentHeatmap: number[];
}> {
  const wordFreqMap: App.wordFreq[] = [];
  const sentimentHeatmap = new Array(24).fill(0);

  const textsArray = posts.map(post => post.value.text || "");

  if (!textsArray.length) {
    console.log('[INFO] No valid text to analyze');
    return { wordFreqMap, sentimentHeatmap };
  }

  try {
    const { nouns_counts, average_sentiments } = await fetchSentimentAnalysis(textsArray);

    nouns_counts.forEach(({ noun, count, sentiment_sum }) => {
      if (!EXCLUDE_WORDS.includes(noun) && noun.length >= MIN_WORD_LENGTH && count >= MIN_WORD_COUNT) {
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

    // count順に降順ソート
    wordFreqMap.sort((a, b) => b.count - a.count);

  } catch (err) {
    console.warn('[WARN] Error in word analyze:', err);
  }

  return { wordFreqMap: wordFreqMap.slice(0, 100), sentimentHeatmap };
}
