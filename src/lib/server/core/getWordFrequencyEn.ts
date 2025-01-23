import { readFileSync } from 'fs';
import { MIN_WORD_COUNT, MIN_WORD_LENGTH } from './config/excludeWords';

// pn_en.dicファイルの読み込み
const dictionaryPath = 'src/lib/server/core/dict/pn_en.dic';
const sentimentDictionary: Record<string, number> = Object.create(null);
readFileSync(dictionaryPath, 'utf-8')
  .split('\n')
  .forEach((line) => {
    const [word, , scoreStr] = line.split(':');
    if (word && scoreStr) {
      sentimentDictionary[word.toLowerCase()] = parseFloat(scoreStr);
    }
  });

export async function getWordFrequencyEn(posts: App.RecordExt[]): Promise<{
  wordFreqMap: App.wordFreq[];
  sentimentHeatmap: number[];
}> {
  const wordFreqMap: App.wordFreq[] = [];
  const sentimentHeatmap = new Array(24).fill(0);

  if (!posts.length) {
    console.log('[INFO] No posts to analyze');
    return { wordFreqMap, sentimentHeatmap };
  }

  const wordCountMap: Record<string, { count: number; sentimentScoreSum: number }> = {};
  const sentimentAccumulator: Record<number, { sum: number; count: number }> = {};

  posts.forEach((post) => {
    const text = post.value.text || '';
    const words = text
      .toLowerCase()
      .split(/\s+/) // 空白で分割
      .map((word) => word.replace(/[^\w]/g, '')); // 特殊文字を削除

    let postSentimentSum = 0;
    let postSentimentCount = 0;

    words.forEach((word) => {
      const sentimentScore = sentimentDictionary[word];
      if (sentimentScore !== undefined && word.length >= MIN_WORD_LENGTH) {
        postSentimentSum += sentimentScore;
        postSentimentCount += 1;

        if (!wordCountMap[word]) {
          wordCountMap[word] = { count: 0, sentimentScoreSum: 0 };
        }
        wordCountMap[word].count += 1;
        wordCountMap[word].sentimentScoreSum += sentimentScore;
      }
    });

    // 投稿単位の感情スコアを保存
    const createdAt = new Date(post.value.createdAt);
    const jstHour = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000).getUTCHours(); // JSTに変換

    sentimentAccumulator[jstHour] = sentimentAccumulator[jstHour] || { sum: 0, count: 0 };
    sentimentAccumulator[jstHour].sum += postSentimentCount > 0 ? postSentimentSum / postSentimentCount : 0;
    sentimentAccumulator[jstHour].count += 1;
  });

  // ヒートマップを計算
  Object.entries(sentimentAccumulator).forEach(([hour, { sum, count }]) => {
    sentimentHeatmap[Number(hour)] = count > 0 ? sum / count : 0;
  });

  // wordFreqMapを作成し、出現回数でソート
  Object.entries(wordCountMap).forEach(([word, { count, sentimentScoreSum }]) => {
    if (count >= MIN_WORD_COUNT) {
      wordFreqMap.push({ noun: word, count, sentimentScoreSum });
    }
  });

  wordFreqMap.sort((a, b) => b.count - a.count);

  return { wordFreqMap: wordFreqMap.slice(0, 100), sentimentHeatmap };
}
