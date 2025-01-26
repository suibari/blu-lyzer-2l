<script lang="ts">
  import InfoWithTooltip from '../icons/InfoWithTooltip.svelte';

  export let title: string;
  export let content: string | number | null;
  export let percentile: number | null = null;
  export let percentileDesc: boolean = false;
  export let type: App.CardType;
  export let id: string | undefined;

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
    return Math.round(percentile * 100) / 100;
  }

  function getPercentileClass(percentile: number) {
    if (percentile <= 10) {
      return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 font-bold';
    } else if (percentile <= 20) {
      return 'text-green-500 font-semibold';
    } else if (percentile <= 40) {
      return 'text-green-400 font-semibold';
    } else if (percentile <= 60) {
      return 'text-yellow-500 font-semibold';
    } else {
      return 'text-red-500';
    }
  }
</script>

<div class="border rounded-lg p-4 bg-white shadow-md">
  <div class="flex gap-2 items-center">
    <h3 class="text-lg font-bold text-gray-800">{title}</h3>
    {#if type === "interval" && id}
      <InfoWithTooltip {id} key_i18n="stats.interval_info" />
    {/if}
  </div>
  <div class="text-xl text-gray-600 mt-2">
    {displayContent}
    {#if percentile}
      <span class="{getPercentileClass(percentile)}">
        (Rank: Top {fixPercentile(percentile, percentileDesc)}%)
      </span>
    {/if}
  </div>
</div>
