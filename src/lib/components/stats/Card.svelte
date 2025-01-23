<script lang="ts">
  export let title: string;
  export let content: string | number | null;
  export let percentile: number | null = null;

  // content が ISO 8601 文字列なら日付変換
  let displayContent: string | number | null = content;

  if (typeof content === "string") {
    const date = new Date(content);
    if (!isNaN(date.getTime())) {
      // ISO 文字列と認識された場合、ローカルの日付形式に変換
      displayContent = date.toLocaleString();
    }
  }
</script>

<div class="border rounded-lg p-4 bg-white shadow-md">
  <h3 class="text-lg font-bold text-gray-800">{title}</h3>
  <div class="text-xl text-gray-600 mt-2">
    {displayContent}
    {#if percentile}
      <span class="text-gray-500"> (Rank: Top {100 - percentile}%)</span>
    {/if}
  </div>
</div>
