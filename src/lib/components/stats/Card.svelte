<script lang="ts">
  export let title: string;
  export let content: string | number | null;
  export let percentile: number | null = null;
  export let percentileDesc: boolean = false;

  // typeの定義
  export let type: App.CardType; // "interval", "length", "date" のみに制限

  let displayContent: string | number | null = content;

  // typeに基づいてdisplayContentを決定
  if (type === "date" && typeof content === "string") {
    const date = new Date(content);
    if (!isNaN(date.getTime())) {
      // ISO文字列と認識された場合、ローカルの日付形式に変換
      displayContent = date.toLocaleString();
    }
  } else if (type === "interval" && typeof content === "number") {
    // 数値なのでAverage Interval系と判定
    const avgValue = Math.round((content / 60) * 100) / 100;
    displayContent = `${avgValue} [min]`;
  } else if (type === "length" && typeof content === "number") {
    // "length"タイプならそのまま数値として表示
    displayContent = `${Math.round(content * 100) / 100}`;
  }

  function fixPercentile(percentile: number, desc: boolean): number {
    if (desc) {
      return Math.round(percentile * 100) / 100;
    } else {
      return Math.round((100 - percentile) * 100) / 100;
    }
  }
</script>

<div class="border rounded-lg p-4 bg-white shadow-md">
  <h3 class="text-lg font-bold text-gray-800">{title}</h3>
  <div class="text-xl text-gray-600 mt-2">
    {displayContent}
    {#if percentile}
      <span class="text-gray-500"> (Rank: Top {fixPercentile(percentile, percentileDesc)}%)</span>
    {/if}
  </div>
</div>
