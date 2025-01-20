<script lang="ts">
  import type { ResultAnalyze } from '$types/api';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let handle: string;
  let resultAnalyze: ResultAnalyze | null = null;
  let error: string | null = null;

  // ページパラメータからドメイン名を取得
  $: handle = page.params.handle;

  // サーバーからJSONを取得
  onMount(async () => {
    try {
      const res = await fetch(`/stats/${handle}`);
      if (res.ok) {
        console.log(res)
        const data = await res.json();
        resultAnalyze = data.result_analyze;
      } else {
        error = `Error fetching data: ${res.statusText}`;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = `Error fetching data: ${err.message}`;
      }
    }
  });
</script>

<h1>Analysis for {handle}</h1>

{#if error}
  <p style="color: red;">{error}</p>
{:else if resultAnalyze}
  <h2>Result Analyze</h2>
  <ul>
    <li><strong>Last Action Time:</strong> {resultAnalyze.lastActionTime}</li>
    <li><strong>Average Interval:</strong> {resultAnalyze.averageInterval}</li>
    <li><strong>Average Text Length:</strong> {resultAnalyze.averageTextLength}</li>
    <li><strong>Recent Friends:</strong> {resultAnalyze.recentFriends}</li>
    <li><strong>Sentiment Heatmap:</strong> {resultAnalyze.sentimentHeatmap}</li>
    <li><strong>Word Frequency Map:</strong> {resultAnalyze.wordFreqMap}</li>
  </ul>
{:else}
  <p>Loading...</p>
{/if}
