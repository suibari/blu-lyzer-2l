import { Inngest } from "inngest";
import { getPercentilesForProperties, getRecordsAndAnalyze, propertyNames, upsertRecords } from "./functions";

export const inngest = new Inngest({ id: "blu-lyzer" });

export const doAnalyzeAndUpsertExistingUser = inngest.createFunction(
  { id: "analyze-upsert" },
  { event: "analyze/existing-user" },
  async ({event, step}) => {
    const handle = event.data.handle;
    const did = event.data.did;
    console.log(`[INFO][INNGEST] start background process: ${handle}`);
    const newResultAnalyze = await getRecordsAndAnalyze(handle, did, 500);
    const percentiles = await getPercentilesForProperties(handle, propertyNames);
    await upsertRecords(handle, newResultAnalyze, percentiles);
  }
)

export const doAnalyzeAndUpsertNewUser = inngest.createFunction(
  { id: "analyze_upsert" },
  { event: "analyze/new-user" },
  async ({event, step}) => {
    const handle = event.data.handle
    const newResultAnalyze = event.data.newResultAnalyze;
    console.log(`[INFO][INNGEST] start background process: ${handle}`);
    const percentiles = await getPercentilesForProperties(handle, propertyNames);
    await upsertRecords(handle, newResultAnalyze, percentiles);
  }
)


export const functions = [
  doAnalyzeAndUpsertExistingUser,
  doAnalyzeAndUpsertNewUser,
];
