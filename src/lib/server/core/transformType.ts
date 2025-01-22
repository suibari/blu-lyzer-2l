import type { ResultAnalyze } from "$types/api";

export const transformDbToApp = (data: any, updated_at: string): ResultAnalyze => {
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
    updatedAt: updated_at,
  };
}

export const transformAppToDb = (resultAnalyze: ResultAnalyze): any => {
  return {
    // all
    averageInterval: resultAnalyze.activity.all.averageInterval,
    activeHistgram: resultAnalyze.activity.all.actionHeatmap,
    lastActionTime: resultAnalyze.activity.all.lastAt,
    // post
    averagePostsInterval: resultAnalyze.activity.post.averageInterval,
    averageTextLength: resultAnalyze.activity.post.averageLength,
    wordFreqMap: resultAnalyze.activity.post.wordFreqMap,
    postHistgram: resultAnalyze.activity.post.actionHeatmap,
    sentimentHeatmap: resultAnalyze.activity.post.sentimentHeatmap,
    lastPostTime: resultAnalyze.activity.post.lastAt,
    // like
    averageLikeInterval: resultAnalyze.activity.like.averageInterval,
    lastLikeTime: resultAnalyze.activity.like.lastAt,
    // repost 
    averageRepostInterval: resultAnalyze.activity.repost.averageInterval,
    lastRepostTime: resultAnalyze.activity.repost.lastAt,
    // relationship
    recentFriends: resultAnalyze.relationship,
    // updatedAt
    updated_at: resultAnalyze.updatedAt,
  };
};
