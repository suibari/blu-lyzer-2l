import { Inngest } from "inngest";
import { getPercentilesForProperties, getRecordsAndAnalyze, upsertRecords } from "./functions";

export const inngest = new Inngest({ id: "blu-lyzer" });

// Shared logic for full analysis
const runFullAnalysis = async (step: any, handle: string, did: string) => {
  console.log(`[INFO][INNGEST] start background process: ${handle}`);

  // Initial state
  let accumulatedRecords: import("../bluesky/getLatestRecords").RecordMap = {
    posts: [],
    likes: [],
    repost: []
  };

  let cursors: { posts?: string; likes?: string; reposts?: string } | undefined = undefined;
  const BATCH_SIZE = 200;
  const TOTAL_LIMIT = 5000;
  const MAX_LOOPS = Math.ceil(TOTAL_LIMIT / BATCH_SIZE);

  for (let i = 0; i < MAX_LOOPS; i++) {
    const result = await step.run(`fetch-records-${i}`, async () => {
      const { getLatestRecords } = await import("../bluesky/getLatestRecords");
      console.log(`[INFO][INNGEST] fetch-records-${i}`);
      return await getLatestRecords(handle, did, BATCH_SIZE, cursors);
    }) as import("../bluesky/getLatestRecords").FetchResult;

    accumulatedRecords.posts = accumulatedRecords.posts.concat(result.records.posts);
    accumulatedRecords.likes = accumulatedRecords.likes.concat(result.records.likes);
    accumulatedRecords.repost = accumulatedRecords.repost.concat(result.records.repost);

    cursors = result.cursors;

    if (!cursors.posts && !cursors.likes && !cursors.reposts) {
      break;
    }
  }

  // Assign to records for next steps
  const records = accumulatedRecords;

  // Sentiment Analysis in Batches
  const POSTS_BATCH_SIZE = 100; // Sentiment analysis is heavy
  const postChunks: App.RecordExt[][] = [];
  for (let i = 0; i < records.posts.length; i += POSTS_BATCH_SIZE) {
    postChunks.push(records.posts.slice(i, i + POSTS_BATCH_SIZE));
  }

  const analyzedChunks: { wordFreqMap: App.WordFreq[], sentimentHeatmap: number[], sentimentHistory: Array<{ date: string, score: number }> }[] = [];
  for (let i = 0; i < postChunks.length; i++) {
    const chunkResult = await step.run(`analyze-posts-chunk-${i}`, async () => {
      const { analyzePosts } = await import("../core/analyzePosts");
      console.log(`[INFO][INNGEST] analyze-posts-chunk-${i}`);
      return await analyzePosts(postChunks[i]);
    });
    analyzedChunks.push(chunkResult);
  }

  // Merge results
  const mergedWordFreqMap: Record<string, App.WordFreq> = {};
  let mergedSentimentHistory: Array<{ date: string, score: number }> = [];

  for (const result of analyzedChunks) {
    // Merge WordFreq
    result.wordFreqMap.forEach((item: App.WordFreq) => {
      if (!mergedWordFreqMap[item.noun]) {
        mergedWordFreqMap[item.noun] = { ...item };
      } else {
        mergedWordFreqMap[item.noun].count += item.count;
        mergedWordFreqMap[item.noun].sentimentScoreSum += item.sentimentScoreSum;
      }
    });

    // Merge History
    mergedSentimentHistory = mergedSentimentHistory.concat(result.sentimentHistory);
  }

  // Sort merged results
  const finalWordFreqMap = Object.values(mergedWordFreqMap).sort((a, b) => b.count - a.count);
  mergedSentimentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Recalculate Heatmap from History
  const finalSentimentHeatmap = new Array(24).fill(0);
  const sentimentAccumulator: Record<number, { sum: number; count: number }> = {};

  mergedSentimentHistory.forEach(item => {
    const date = new Date(item.date);
    const jstHour = new Date(date.getTime() + 9 * 60 * 60 * 1000).getUTCHours();
    if (!sentimentAccumulator[jstHour]) {
      sentimentAccumulator[jstHour] = { sum: 0, count: 0 };
    }
    sentimentAccumulator[jstHour].sum += item.score;
    sentimentAccumulator[jstHour].count++;
  });

  Object.entries(sentimentAccumulator).forEach(([hour, { sum, count }]) => {
    finalSentimentHeatmap[Number(hour)] = count > 0 ? sum / count : 0;
  });

  const analyzedPostsData = {
    wordFreqMap: finalWordFreqMap,
    sentimentHeatmap: finalSentimentHeatmap,
    sentimentHistory: mergedSentimentHistory
  };

  const newResultAnalyze = await step.run("analyze-records", async () => {
    const { analyzeRecords } = await import("../core/analyzeRecords");
    return await analyzeRecords(did, records, analyzedPostsData);
  }) as App.ResultAnalyze;
  console.log("[INFO][INNGEST] analyze-records");

  await step.run("upsert-records-intermediate", async () => {
    await upsertRecords(handle, newResultAnalyze, null);
  });
  console.log("[INFO][INNGEST] upsert-records-intermediate");

  const percentiles = await step.run("get-percentiles", async () => {
    // パーセンタイルを求めるためには2回DB操作が必要
    return await getPercentilesForProperties(handle);
  });
  console.log("[INFO][INNGEST] get-percentiles");

  await step.run("upsert-records-final", async () => {
    await upsertRecords(handle, newResultAnalyze, percentiles);
  });
  console.log("[INFO][INNGEST] upsert-records-final");
};

export const doAnalyzeAndUpsertExistingUser = inngest.createFunction(
  { id: "analyze-upsert" },
  { event: "analyze/existing-user" },
  async ({ event, step }) => {
    const handle = event.data.handle;
    const did = event.data.did;
    await runFullAnalysis(step, handle, did);
  }
)

export const doAnalyzeAndUpsertNewUser = inngest.createFunction(
  { id: "analyze_upsert" },
  { event: "analyze/new-user" },
  async ({ event, step }) => {
    const handle = event.data.handle
    const did = event.data.did;
    await runFullAnalysis(step, handle, did);
  }
)

export const functions = [
  doAnalyzeAndUpsertExistingUser,
  doAnalyzeAndUpsertNewUser,
];
