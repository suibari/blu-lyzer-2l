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
  let summary: Array<{ title: string; content: string | number | null }>

  // ------------------------
  // fetch
  // ------------------------
  $: handle = page.params.handle;

  onMount(async () => {
    try {
      const res = await fetch(`/stats/${handle}`);
      if (res.ok) {
        console.log(res)
        resultAnalyze = await res.json();
      } else {
        error = `Error fetching data: ${res.statusText}`;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = `Error fetching data: ${err.message}`;
      }
    }

    summary = [
      { title: 'Last Action Time', content: resultAnalyze.activity.all.lastAt },
      { title: 'Average Interval', content: resultAnalyze.activity.all.averageInterval },
      { title: 'Average Text Length', content: resultAnalyze.activity.post.averageLength }
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
    <CardFriends recentFriends={resultAnalyze.relationship} />
    <GraphGrid sentimentHeatmap={resultAnalyze.activity.post.sentimentHeatmap} activeHistgram={resultAnalyze.activity.all.actionHeatmap} />
  </div>
{:else}
  <p>Loading...</p>
{/if}
