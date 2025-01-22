<script lang="ts">
  import type { ResultAnalyze, RecentFriend } from '$types/api';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import AnalyzeGrid from '$lib/components/CardGrid.svelte';
  import GraphGrid from '$lib/components/GraphGrid.svelte';
  import CardWide from '$lib/components/CardWide.svelte';
    import CardGrid from '$lib/components/CardGrid.svelte';

  let handle: string;
  let resultAnalyze: ResultAnalyze;
  let error: string | null = null;
  let summary: Array<{ title: string; content: string | number | null }> = [];

  // ------------------------
  // fetch
  // ------------------------
  $: handle = page.params.handle;

  onMount(async () => {
    try {
      const res = await fetch(`/stats/${handle}`);
      if (res.ok) {
        resultAnalyze = await res.json();
      } else {
        error = `Error fetching data: ${res.statusText}`;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = `Error fetching data: ${err.message}`;
      }
    }

    // Prepare the summary data
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
    
    <!-- all activity -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">All Activity</h3>
      <CardGrid
        cards={summary}
      />
    </div>
    
    <!-- Post Activity -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Post Activity</h3>
      <CardGrid
        cards={[
          { title: 'Avg Interval', content: resultAnalyze.activity.post.averageInterval },
          { title: 'Avg Text Length', content: resultAnalyze.activity.post.averageLength }
        ]}
      />
      
      {#if resultAnalyze.activity.post.wordFreqMap}
        <CardWide 
          title="Word Frequencies" 
          items={resultAnalyze.activity.post.wordFreqMap.map(word => ({ label: word.noun, value: word.count }))} 
        />
      {/if}
      
      <GraphGrid 
        sentimentHeatmap={resultAnalyze.activity.post.sentimentHeatmap}
        activeHistgram={resultAnalyze.activity.all.actionHeatmap} 
      />
    </div>

    <!-- Like Activity -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Like Activity</h3>
      <CardGrid
        cards={[
          { title: 'Avg Interval', content: resultAnalyze.activity.like.averageInterval },
          { title: 'Last Activity', content: resultAnalyze.activity.like.lastAt }
        ]}
      />
    </div>
    
    <!-- Repost Activity -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Repost Activity</h3>
      <CardGrid
        cards={[
          { title: 'Avg Interval', content: resultAnalyze.activity.repost.averageInterval },
          { title: 'Last Activity', content: resultAnalyze.activity.repost.lastAt }
        ]}
      />
    </div>
    
    <!-- Recent Friends -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Recent Friends</h3>
      <CardWide
        title="Recent Friends"
        items={resultAnalyze.relationship.map((friend) => ({
          label: friend.displayName || '',
          value: friend.score,
          img: friend.avator,
          handle: friend.handle,
        }))}
      />
    </div>

    <!-- Last Updated -->
    <div class="p-4 text-right text-sm text-gray-500">
      <p>Last updated: {resultAnalyze.updatedAt}</p>
    </div>
  </div>


{:else}
  <p>Loading...</p>
{/if}
