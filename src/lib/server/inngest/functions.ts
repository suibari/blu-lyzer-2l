import { inngest } from ".";
import { getLatestRecords } from "../bluesky/getLatestRecords";
import { analyzeRecords } from "../core/analyzeRecords";
import { transformAppToDb } from "../core/transformType";
import { supabase } from "../supabase";

const propertyNames = [
  "averageInterval",
  "averagePostsInterval",
  "averageLikeInterval",
  "averageRepostInterval",
  "averageTextLength",
];

export const doAnalyzeAndUpsertExistingUser = inngest.createFunction(
  { id: "analyze-upsert" },
  { event: "analyze/existing-user" },
  async ({event, step}) => {
    const handle = event.data.handle
    console.log(`[INFO][INNGEST] start background process: ${handle}`);
    const newResultAnalyze = await getRecordsAndAnalyze(handle, 400);
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

export async function getRecordsAndAnalyze (handle: string, limit: number): Promise<App.ResultAnalyze> {
  const records = await getLatestRecords(handle, limit);
  const resultAnalyze = await analyzeRecords(handle, records);
  console.log(`[INFO][INNGEST] get result_analyze: ${handle}`);
  return resultAnalyze;
}

export async function upsertRecords (handle: string, resultAnalyze: App.ResultAnalyze, percentiles: Record<string, { value: number } | null>) {
  await supabase
    .from("records")
    .upsert([{
      handle,
      result_analyze: transformAppToDb(resultAnalyze),
      percentiles,
      updated_at: new Date().toISOString(),
    }]);
  console.log(`[INFO][INNGEST] updated result_analyze: ${handle}`);
}

/**
 * 複数のプロパティのパーセンタイルを順次取得
 * @param handle 対象のハンドル
 * @param propertyNames 複数のプロパティ名
 * @returns 各プロパティのパーセンタイルと値を含むオブジェクト
 */
async function getPercentilesForProperties(handle: string, propertyNames: string[]) {
  const percentiles: Record<string, { value: number } | null> = {};

  // 各プロパティ名について順次RPCを実行
  for (const propertyName of propertyNames) {
    const { data, error } = await supabase.rpc('get_json_property_percentile', {
      target_handle: handle,
      property_name: propertyName,
    });

    if (error) {
      console.error(`Error fetching percentile for property: ${propertyName}`, error);
      percentiles[propertyName] = null;  // エラーが発生した場合はnullを設定
      continue;
    }

    if (data) {
      percentiles[propertyName] = data;
    } else {
      percentiles[propertyName] = null;  // データがなければnullを設定
    }
  }

  return percentiles;
}
