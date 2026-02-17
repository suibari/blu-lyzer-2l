import { Inngest } from "inngest";
import { getPercentilesForProperties, getRecordsAndAnalyze, upsertRecords } from "./functions";

export const inngest = new Inngest({ id: "blu-lyzer" });

export const doAnalyzeAndUpsertExistingUser = inngest.createFunction(
  { id: "analyze-upsert" },
  { event: "analyze/existing-user" },
  async ({ event, step }) => {
    const handle = event.data.handle;
    const did = event.data.did;
    console.log(`[INFO][INNGEST] start background process: ${handle}`);

    // Re-writing the logic to properly use Inngest steps *outside* the inner function
    // We need to construct the records by running multiple steps

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

      // If no more data in any category, we *could* break, but getLatestRecords handles empty cursors gracefully (returns empty list).
      // Optimization: if all cursors are undefined, break.
      if (!cursors.posts && !cursors.likes && !cursors.reposts) {
        break;
      }
    }

    // Assign to records for next steps
    const records = accumulatedRecords;

    const newResultAnalyze = await step.run("analyze-records", async () => {
      const { analyzeRecords } = await import("../core/analyzeRecords");
      return await analyzeRecords(did, records);
    }) as App.ResultAnalyze;

    await step.run("upsert-records-intermediate", async () => {
      await upsertRecords(handle, newResultAnalyze, null);
    });

    const percentiles = await step.run("get-percentiles", async () => {
      // パーセンタイルを求めるためには2回DB操作が必要
      return await getPercentilesForProperties(handle);
    });

    await step.run("upsert-records-final", async () => {
      await upsertRecords(handle, newResultAnalyze, percentiles);
    });
  }
)

export const doAnalyzeAndUpsertNewUser = inngest.createFunction(
  { id: "analyze_upsert" },
  { event: "analyze/new-user" },
  async ({ event, step }) => {
    const handle = event.data.handle
    const newResultAnalyze = event.data.newResultAnalyze;
    console.log(`[INFO][INNGEST] start background process: ${handle}`);
    const percentiles = await getPercentilesForProperties(handle);
    await upsertRecords(handle, newResultAnalyze, percentiles);
  }
)


export const functions = [
  doAnalyzeAndUpsertExistingUser,
  doAnalyzeAndUpsertNewUser,
];
