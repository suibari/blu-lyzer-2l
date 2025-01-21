import type { ResultAnalyze } from "$types/api";

export const transformDbDataToAppStructure = (data: any): ResultAnalyze => {
  return {
    activity: {
      all: {
        averageInterval: data.averageInterval || null,
        actionHeatmap: data.activeHistgram || [],
        lastAt: data.lastActionTime || null,
      },
      post: {
        averageInterval: data.averagePostsInterval || null,
        averageLength: data.averageTextLength || null,
        wordFreqMap: data.wordFreqMap || null,
        actionHeatmap: data.postHistgram || [],
        sentimentHeatmap: data.sentimentHeatmap || [],
        lastAt: data.lastPostTime || null,
      },
      like: {
        averageInterval: data.averageLikeInterval || null,
        lastAt: data.lastLikeTime || null,
      },
      repost: {
        averageInterval: data.averageRepostInterval || null,
        lastAt: data.lastRepostTime || null,
      },
    },
    relationship: data.recentFriends || [],
  };
}