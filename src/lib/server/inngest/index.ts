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
    const newResultAnalyze = await getRecordsAndAnalyze(handle);
    await upsertRecords(handle, newResultAnalyze);
  }
)

const doAnalyzeAndUpsertNewUser = inngest.createFunction(
  { id: "analyze_upsert" },
  { event: "analyze/new-user" },
  async ({event, step}) => {
    const handle = event.data.handle
    const newResultAnalyze = event.data.newResultAnalyze
    console.log(`[INFO] start background process: ${handle}`)
    await upsertRecords(handle, newResultAnalyze);
  }
)

export async function getRecordsAndAnalyze (handle: string): Promise<App.ResultAnalyze> {
  const records = await getLatestRecords(handle);
  const resultAnalyze = await analyzeRecords(records);
  console.log(`[INFO] get result_analyze: ${handle}`);
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
  console.log(`[INFO] updated result_analyze: ${handle}`);
}

export const functions = [
  doAnalyzeAndUpsertExistingUser,
  doAnalyzeAndUpsertNewUser,
];
