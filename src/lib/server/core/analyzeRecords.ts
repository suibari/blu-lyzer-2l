import { getNounFrequencies } from "./getNounFrequencies";
import SessionManager from '../bluesky/sessionManager';
import { getWordFrequencyEn } from "./getWordFrequencyEn";
import { analyzePosts } from "./analyzePosts";

const SCORE_REPLY = 10;
const SCORE_LIKE = 1;

export type RecordMap = {
  posts: App.RecordExt[],
  likes: App.RecordExt[],
  repost: App.RecordExt[]
}

const sessionManager = SessionManager.getInstance();

export async function analyzeRecords(did: string, records: RecordMap): Promise<App.ResultAnalyze> {
  const allRecords = collectAllRecords(records);

  // 頻出単語分析
  const { wordFreqMap, sentimentHeatmap } = await analyzePosts(records.posts);

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
        actionHeatmap: generateActiveHeatmap(records.likes),
        lastAt: getLastActionTime(records.likes),
      },
      repost: {
        averageInterval: calculateAverageInterval(records.repost),
        actionHeatmap: generateActiveHeatmap(records.repost),
        lastAt: getLastActionTime(records.repost),
      },
    },
    relationship: await getRecentFriends(did, records.posts, records.likes),
    updatedAt: new Date().toISOString(),
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
function generateActiveHeatmap(records: App.RecordExt[]): number[] {
  const heatmap = new Array(24).fill(0);
  records.forEach(record => {
    const hourKey = getJSTHour(record);
    heatmap[hourKey]++;
  });
  return heatmap;
}

// Get hour in JST (UTC+9)
function getJSTHour(record: App.RecordExt) {
  const utcDate = new Date(record.value.createdAt);
  const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // Convert to JST
  return jstDate.getUTCHours();
}

// Get last action time
function getLastActionTime(records: App.RecordExt[]): string | null {
  if (records.length === 0) return null;

  // Sort by createdAt in descending order
  records.sort(
    (a, b) => new Date(b.value.createdAt).getTime() - new Date(a.value.createdAt).getTime()
  );

  return new Date(records[0].value.createdAt).toISOString();
}

// Calculate average text length for posts
function calculateAverageTextLength(posts: App.RecordExt[]) {
  const totalTextLength = posts.reduce((total, post) => {
    return total + (post.value.text?.length || 0);
  }, 0);

  return posts.length > 0 ? totalTextLength / posts.length : 0;
}

// Get recent friends with reply and like score
async function getRecentFriends(did: string, posts: App.RecordExt[], likes: App.RecordExt[]) {
  let recentFriends: App.RecentFriend[] = [];
  let didReply = extractDidFromReplies(posts);
  let didLike = extractDidFromLikes(likes);

  recentFriends = aggregateRecentFriends(didReply, recentFriends, SCORE_REPLY);
  recentFriends = aggregateRecentFriends(didLike, recentFriends, SCORE_LIKE);

  // 自分を除外
  const recentFriendsFiltered = recentFriends.filter(friend => friend.did !== did );

  // getProfilesが25までなのでslice
  const recentFriendsSorted = sortRecentFriendsByScore(recentFriendsFiltered);
  const recentFriendsSliced = recentFriendsSorted.slice(0, 25);

  // getProfilesし、recentFriendsに名前やアバターを追加
  const actors = recentFriendsSliced.map(friend => friend.did);

  if (actors.length > 0) {
    await sessionManager.createOrRefreshSession();
    const agent = sessionManager.getAgent();
    const {data} = await agent.getProfiles({actors});
    recentFriendsSliced.forEach(friend => {
      const matchProf = data.profiles.find(profile => profile.did === friend.did);
      if (matchProf) {
        friend.handle = matchProf.handle;
        friend.displayName = matchProf.displayName;
        friend.avator = matchProf.avatar;
      }
    })  
  }
  
  return recentFriendsSliced;
}

// Extract DID from post replies
function extractDidFromReplies(posts: App.RecordExt[]) {
  let didReply: string[] = [];
  posts.forEach(post => {
    const uri = post.value.reply?.parent.uri;
    const did = uri ? uri.match(/did:plc:\w+/)?.[0] : null;
    if (did) didReply.push(did);
  });
  return didReply;
}

// Extract DID from likes
function extractDidFromLikes(likes: App.RecordExt[]) {
  let didLike: string[] = [];
  likes.forEach(like => {
    const uri = like.value.subject?.uri;
    const did = uri ? uri.match(/did:plc:\w+/)?.[0] : null;
    if (did) didLike.push(did);
  });
  return didLike;
}

// Aggregate recent friends by DID and score type
function aggregateRecentFriends(dids: string[], recentFriends: App.RecentFriend[], score: number) {
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
function sortRecentFriendsByScore(recentFriends: App.RecentFriend[]) {
  return recentFriends.sort((a, b) => b.score - a.score);
}

// Calculate the average interval between posts/likes
function calculateAverageInterval(records: App.RecordExt[]): number {
  // const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Filter last 7 days
  // const recentRecords = records.filter(record => new Date(record.value.createdAt) >= oneWeekAgo);

  // Sort records by createdAt in ascending order
  records.sort(
    (a, b) =>
      new Date(a.value.createdAt).getTime() - new Date(b.value.createdAt).getTime()
  );

  let totalInterval = 0;
  let intervalsCount = 0;

  for (let i = 1; i < records.length; i++) {
    const interval =
      new Date(records[i].value.createdAt).getTime() -
      new Date(records[i - 1].value.createdAt).getTime();
    totalInterval += interval;
    intervalsCount++;
  }

  // Return the average interval in seconds or 0 if there are no intervals
  return intervalsCount > 0 ? totalInterval / intervalsCount / 1000 : 0;
}
