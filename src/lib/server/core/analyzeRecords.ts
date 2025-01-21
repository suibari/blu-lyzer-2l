import type { Record } from '@atproto/api/dist/client/types/com/atproto/repo/listRecords';
import { getNounFrequencies } from "./getNounFrequencies";
import type { RecentFriend, ResultAnalyze } from "$types/api";
import type { RecordExt } from '$types/atproto';

const SCORE_REPLY = 10;
const SCORE_LIKE = 1;

export type RecordMap = {
  posts: RecordExt[],
  likes: RecordExt[],
  repost: RecordExt[]
}

export async function analyzeRecords(records: RecordMap): Promise<ResultAnalyze> {
  const allRecords = collectAllRecords(records);

  // 頻出単語分析
  const { wordFreqMap, sentimentHeatmap } = await getNounFrequencies(records.posts);

  return {
    activity: {
      all: {
        averageInterval: calculateAverageInterval(allRecords),
        actionHeatmap: generateActiveHeatmap(allRecords),
        lastAt: getLastActionTime(allRecords),
      },
      post: {
        averageInterval: calculateAverageInterval(records.posts),
        averageLength: calculateAverageTextLength(records.posts),
        wordFreqMap: wordFreqMap,
        actionHeatmap: generateActiveHeatmap(records.posts),
        sentimentHeatmap: sentimentHeatmap,
        lastAt: getLastActionTime(records.posts),
      },
      like: {
        averageInterval: calculateAverageInterval(records.likes),
        lastAt: getLastActionTime(records.likes),
      },
      repost: {
        averageInterval: calculateAverageInterval(records.repost),
        lastAt: getLastActionTime(records.repost),
      },
    },
    relationship: getRecentFriends(records.posts, records.likes),
    updatedAt: new Date().toDateString(),
  }
}

// ---------------------------
// Collecting all records
function collectAllRecords(records: RecordMap) {
  return [
    ...(Array.isArray(records.posts) ? records.posts : []),
    ...(Array.isArray(records.likes) ? records.likes : []),
    ...(Array.isArray(records.repost) ? records.repost : []),
  ];
}

// Generate activity histogram
function generateActiveHeatmap(records: RecordExt[]): number[] {
  const heatmap = new Array(24).fill(0);
  records.forEach(record => {
    const hourKey = getJSTHour(record);
    heatmap[hourKey]++;
  });
  return heatmap;
}

// Get hour in JST (UTC+9)
function getJSTHour(record: RecordExt) {
  const utcDate = new Date(record.value.createdAt);
  const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // Convert to JST
  return jstDate.getUTCHours();
}

// Get last action time
function getLastActionTime(records: RecordExt[]): string | null {
  if (records.length === 0) return null;

  // Sort by createdAt in descending order
  records.sort(
    (a, b) => new Date(b.value.createdAt).getTime() - new Date(a.value.createdAt).getTime()
  );

  return new Date(records[0].value.createdAt).toLocaleDateString();
}

// Calculate average text length for posts
function calculateAverageTextLength(posts: RecordExt[]) {
  const totalTextLength = posts.reduce((total, post) => {
    return total + (post.value.text?.length || 0);
  }, 0);

  return posts.length > 0 ? totalTextLength / posts.length : 0;
}

// Get recent friends with reply and like score
function getRecentFriends(posts: RecordExt[], likes: RecordExt[]) {
  let recentFriends: RecentFriend[] = [];
  let didReply = extractDidFromReplies(posts);
  let didLike = extractDidFromLikes(likes);

  recentFriends = aggregateRecentFriends(didReply, recentFriends, SCORE_REPLY);
  recentFriends = aggregateRecentFriends(didLike, recentFriends, SCORE_LIKE);

  return sortRecentFriendsByScore(recentFriends);
}

// Extract DID from post replies
function extractDidFromReplies(posts: RecordExt[]) {
  let didReply: string[] = [];
  posts.forEach(post => {
    const uri = post.value.reply?.parent.uri;
    const did = uri ? uri.match(/did:plc:\w+/)?.[0] : null;
    if (did) didReply.push(did);
  });
  return didReply;
}

// Extract DID from likes
function extractDidFromLikes(likes: RecordExt[]) {
  let didLike: string[] = [];
  likes.forEach(like => {
    const uri = like.value.subject?.uri;
    const did = uri ? uri.match(/did:plc:\w+/)?.[0] : null;
    if (did) didLike.push(did);
  });
  return didLike;
}

// Aggregate recent friends by DID and score type
function aggregateRecentFriends(dids: string[], recentFriends: RecentFriend[], score: number) {
  dids.forEach(did => {
    let flagFound = false;
    for (const node of recentFriends) {
      if (node.did === did) {
        node.score += score;
        node.replyCount = (node.replyCount || 0) + (score === SCORE_REPLY ? 1 : 0);
        node.likeCount = (node.likeCount || 0) + (score === SCORE_LIKE ? 1 : 0);
        flagFound = true;
        break;
      }
    }
    if (!flagFound) {
      recentFriends.push({ did, score, replyCount: score === SCORE_REPLY ? 1 : 0, likeCount: score === SCORE_LIKE ? 1 : 0 });
    }
  });
  return recentFriends;
}

// Sort recent friends by score in descending order
function sortRecentFriendsByScore(recentFriends: RecentFriend[]) {
  return recentFriends.sort((a, b) => b.score - a.score);
}

// Calculate the average interval between posts/likes
function calculateAverageInterval(records: RecordExt[]): number {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Filter last 7 days
  const recentRecords = records.filter(record => new Date(record.value.createdAt) >= oneWeekAgo);

  // Sort records by createdAt in ascending order
  recentRecords.sort(
    (a, b) =>
      new Date(a.value.createdAt).getTime() - new Date(b.value.createdAt).getTime()
  );

  let totalInterval = 0;
  let intervalsCount = 0;

  for (let i = 1; i < recentRecords.length; i++) {
    const interval =
      new Date(recentRecords[i].value.createdAt).getTime() -
      new Date(recentRecords[i - 1].value.createdAt).getTime();
    totalInterval += interval;
    intervalsCount++;
  }

  // Return the average interval in seconds or 0 if there are no intervals
  return intervalsCount > 0 ? totalInterval / intervalsCount / 1000 : 0;
}
