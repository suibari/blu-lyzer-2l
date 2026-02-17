import { inngest } from ".";
import { getLatestRecords } from "../bluesky/getLatestRecords";
import { analyzeRecords } from "../core/analyzeRecords";
import { transformAppToDb } from "../core/transformType";
import { db } from "../postgres";

const propertyNames: Array<keyof App.Percentiles> = [
  "averageInterval",
  "averagePostsInterval",
  "averageLikeInterval",
  "averageRepostInterval",
  "averageTextLength",
  "averageReplyInterval",
];

export async function getRecordsAndAnalyze(handle: string, did: string, limit: number): Promise<App.ResultAnalyze> {
  const records = await getLatestRecords(handle, did, limit);
  const resultAnalyze = await analyzeRecords(did, records);
  console.log(`[INFO][INNGEST] get result_analyze: ${handle}`);
  return resultAnalyze;
}

export async function upsertRecords(handle: string, resultAnalyze: App.ResultAnalyze, percentiles: App.Percentiles | null) {
  const dataToUpsert: any = {
    handle,
    result_analyze: transformAppToDb(resultAnalyze),
    updated_at: new Date().toISOString(),
  };

  // percentiles が null でない場合のみ upsert データに追加
  if (percentiles !== null) {
    dataToUpsert.percentiles = percentiles;
  }

  await db.upsertRecords([dataToUpsert]);

  console.log(`[INFO][INNGEST] updated result_analyze: ${handle}`);
}

/**
 * 複数のプロパティのパーセンタイルを順次取得
 * @param handle 対象のハンドル
 * @param propertyNames 複数のプロパティ名
 * @returns 各プロパティのパーセンタイルと値を含むオブジェクト
 */
export async function getPercentilesForProperties(handle: string) {
  const percentiles: Record<string, { value: number } | null> = {};

  // Execute RPC calls in parallel
  const results = await Promise.all(
    propertyNames.map(async (propertyName) => {
      const rpcFuncName = (propertyName === "averageTextLength") ? "get_json_property_percentile" : "get_json_property_percentile_asc";

      try {
        const data = await db.rpc(rpcFuncName, {
          target_handle: handle,
          property_name: propertyName,
        });

        return { propertyName, value: data ?? null };
      } catch (error) {
        console.error(`Error fetching percentile for property: ${propertyName}`, error);
        return { propertyName, value: null };
      }


    })
  );

  // Map results back to the percentiles object
  results.forEach(({ propertyName, value }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (percentiles as any)[propertyName] = value;
  });

  return percentiles as unknown as App.Percentiles;
}
