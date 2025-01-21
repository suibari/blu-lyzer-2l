export interface ResultAnalyze {
  activity: {
    all: {
      averageInterval: number|null;
      actionHeatmap: number[];
      lastAt: string|null;
    };
    post: {
      averageInterval: number|null;
      averageLength: number|null;
      wordFreqMap: wordFreq[]|null;
      actionHeatmap: number[];
      sentimentHeatmap: number[];
      lastAt: string|null;
    };
    like: {
      averageInterval: number|null;
      lastAt: string|null;
    };
    repost: {
      averageInterval: number|null;
      lastAt: string|null;
    };
  };
  relationship: RecentFriend[];
}

export interface wordFreq {
  noun: string;
  count: number;
  sentimentScoreSum: number;
};

export interface RecentFriend {
  did: string;
  handle?: string;
  displayName?: string;
  score: number;
  replyCount?: number;
  likeCount?: number;
};

export interface ResultAnalyzeDB {
  // all
  averageInterval: number;
  activeHistgram: number[];
  lastActionTime: string;
  // post
  averagePostsInterval: number;
  averageTextLength: number;
  wordFreqMap: number[];
  postHistgram?: number[];
  sentimentHeatmap: number[];
  lastPostTime?: string[];
  // like
  averageLikeInterval?: number;
  lastLikeTime?: string[];
  // repost
  averageRepostInterval?: number;
  lastRepostTime?: string[];
  // relationship
  recentFriends: RecentFriend[];
}
