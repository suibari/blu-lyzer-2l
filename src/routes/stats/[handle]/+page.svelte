<script lang="ts">
  import type { ResultAnalyze } from '$types/api';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import AnalyzeGrid from '$lib/components/CardGrid.svelte';
  import GraphGrid from '$lib/components/GraphGrid.svelte';
    import CardFriends from '$lib/components/CardFriends.svelte';

  let handle: string;
  let resultAnalyze: ResultAnalyze;
  let error: string | null = null;
  let summary: Array<{ title: string; content: string | number }>

  // ------------------------
  // fetch
  // ------------------------
  $: handle = page.params.handle;

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

    summary = [
      { title: 'Last Action Time', content: resultAnalyze.lastActionTime },
      { title: 'Average Interval', content: resultAnalyze.averageInterval },
      { title: 'Average Text Length', content: resultAnalyze.averageTextLength }
    ];
  });
</script>

<h1 class="text-2xl">Analysis for {handle}</h1>

{#if error}
  <p style="color: red;">{error}</p>
{:else if resultAnalyze}
  <div class="p-8 bg-gray-100 space-y-4">
    <h2 class="text-2xl font-bold mb-6 text-gray-700">Result Analyze</h2>
    <AnalyzeGrid cards={summary} />
    <CardFriends recentFriends={resultAnalyze.recentFriends} />
    <GraphGrid sentimentHeatmap={resultAnalyze.sentimentHeatmap} activeHistgram={resultAnalyze.activeHistgram} />
  </div>
{:else}
  <p>Loading...</p>
{/if}
