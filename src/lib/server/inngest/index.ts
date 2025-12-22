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

    const records = await step.run("fetch-records", async () => {
      const { getLatestRecords } = await import("../bluesky/getLatestRecords");
      return await getLatestRecords(handle, did, 300);
    }) as import("../bluesky/getLatestRecords").RecordMap;

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
