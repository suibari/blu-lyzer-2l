export interface ResultAnalyze {
  wordFreqMap: [
    {
      noun: string,
      count: number,
      sentimentScoreSum: number,
    }
  ];
  recentFriends: [
    {
      did: string,
      score: number,
      likeCount: number,
      replyCount: number,
    }
  ];
  activeHistgram: number[];
  lastActionTime: string;
  averageInterval: number;
  sentimentHeatmap: number[];
  averageTextLength: number;
  averagePostsInterval: number;
}
