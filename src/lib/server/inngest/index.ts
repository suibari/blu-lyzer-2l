import { Inngest } from "inngest";
import { getLatestRecords } from "../bluesky/getLatestRecords";
import { analyzeRecords } from "../core/analyzeRecords";
import { transformAppToDb } from "../core/transformType";
import { supabase } from "../supabase";

export const inngest = new Inngest({ id: "blu-lyzer" });

const doAnalyzeAndUpsertExistingUser = inngest.createFunction(
  { id: "analyze-upsert" },
  { event: "analyze/existing-user" },
  async ({event, step}) => {
    const handle = event.data.handle
    console.log(`[INFO][INNGEST] start background process: ${handle}`);
    const newResultAnalyze = await getRecordsAndAnalyze(handle, 400);
    await upsertRecords(handle, newResultAnalyze);
  }
)

const doAnalyzeAndUpsertNewUser = inngest.createFunction(
  { id: "analyze_upsert" },
  { event: "analyze/new-user" },
  async ({event, step}) => {
    const handle = event.data.handle
    const newResultAnalyze = event.data.newResultAnalyze
    console.log(`[INFO][INNGEST] start background process: ${handle}`)
    await upsertRecords(handle, newResultAnalyze);
  }
)

export async function getRecordsAndAnalyze (handle: string, limit: number): Promise<App.ResultAnalyze> {
  const records = await getLatestRecords(handle, limit);
  const resultAnalyze = await analyzeRecords(handle, records);
  console.log(`[INFO][INNGEST] get result_analyze: ${handle}`);
  return resultAnalyze;
}

export async function upsertRecords (handle: string, resultAnalyze: App.ResultAnalyze) {
  await supabase
    .from("records")
    .upsert([{
      handle,
      result_analyze: transformAppToDb(resultAnalyze),
      updated_at: new Date().toISOString(),
    }]);
  console.log(`[INFO][INNGEST] updated result_analyze: ${handle}`);
}

export const functions = [
  doAnalyzeAndUpsertExistingUser,
  doAnalyzeAndUpsertNewUser,
];
