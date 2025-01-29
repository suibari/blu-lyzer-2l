export const transformDbToApp = (data: App.ResultAnalyzeDB, updated_at: string): App.ResultAnalyze => {
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
        reply: {
          averageInterval: data.averageReplyInterval || undefined,
          actionHeatmap: data.replyHistgram || undefined,
          lastAt: data.lastReplyTime || undefined,
        }
      },
      like: {
        averageInterval: data.averageLikeInterval || null,
        actionHeatmap: data.likeHistgram || [],
        lastAt: data.lastLikeTime || null,
      },
      repost: {
        averageInterval: data.averageRepostInterval || null,
        actionHeatmap: data.repostHistgram || [],
        lastAt: data.lastRepostTime || null,
      },
    },
    relationship: data.recentFriends || [],
    updatedAt: updated_at,
  };
}

export const transformAppToDb = (resultAnalyze: App.ResultAnalyze): App.ResultAnalyzeDB => {
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
    // reply
    averageReplyInterval: resultAnalyze.activity.post.reply.averageInterval || null,
    replyHistgram: resultAnalyze.activity.post.reply.actionHeatmap || null,
    lastReplyTime: resultAnalyze.activity.post.reply.lastAt || null,
    // like
    averageLikeInterval: resultAnalyze.activity.like.averageInterval,
    likeHistgram: resultAnalyze.activity.like.actionHeatmap,
    lastLikeTime: resultAnalyze.activity.like.lastAt,
    // repost 
    averageRepostInterval: resultAnalyze.activity.repost.averageInterval,
    repostHistgram: resultAnalyze.activity.repost.actionHeatmap,
    lastRepostTime: resultAnalyze.activity.repost.lastAt,
    // relationship
    recentFriends: resultAnalyze.relationship,
  };
};
