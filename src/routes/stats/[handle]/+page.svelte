<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import CardWide from '$lib/components/stats/CardWide.svelte';
  import CardGrid from '$lib/components/stats/CardGrid.svelte';
  import LineGraph from '$lib/components/stats/LineGraph.svelte';
  import BarGraph from '$lib/components/stats/BarGraph.svelte';

  let handle: string;
  let resultAnalyze: App.ResultAnalyze;
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
      { title: 'Average Interval', content: resultAnalyze.activity.all.averageInterval },
      { title: 'Last Action Time', content: resultAnalyze.activity.all.lastAt },
    ];
  });
</script>

{#if error}
  <p style="color: red;">{error}</p>
{:else if resultAnalyze}
  <div class="p-8 bg-gray-100 space-y-4">
    <h2 class="text-2xl font-bold mb-6 text-gray-700">Result Analyze for {handle}</h2>

    <!-- Recent Friends -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Relationship</h3>
      <CardWide
        title="Recent Friends"
        items={resultAnalyze.relationship.map((friend) => ({
          label: friend.displayName || '',
          value: friend.score,
          img: friend.avator,
          handle: friend.handle,
          replies: friend.replyCount,
          likes: friend.likeCount,
        }))}
      />
    </div>

    <!-- all activity -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">All Activity</h3>
      <CardGrid cards={summary} />
      <BarGraph
        postData={resultAnalyze.activity.post.actionHeatmap}
        likeData={resultAnalyze.activity.like.actionHeatmap}
        repostData={resultAnalyze.activity.repost.actionHeatmap}
      />
    </div>
    
    <!-- Post Activity -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Post Activity</h3>
      <CardGrid
        cards={[
          { title: 'Avg Interval', content: resultAnalyze.activity.post.averageInterval },
          { title: 'Avg Text Length', content: resultAnalyze.activity.post.averageLength },
        ]}
      />
      
      {#if resultAnalyze.activity.post.wordFreqMap}
        <CardWide 
          title="Word Frequencies" 
          items={resultAnalyze.activity.post.wordFreqMap.map(word => ({ label: word.noun, value: word.count }))} 
        />
      {/if}
      
      <LineGraph data={resultAnalyze.activity.post.sentimentHeatmap} centerZero={true} />
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
    
    <!-- Last Updated -->
    <div class="p-4 text-right text-sm text-gray-500">
      <p>Last updated: {new Date(resultAnalyze.updatedAt).toLocaleString()}</p>
    </div>
  </div>


{:else}
  <p class="text-center justify-center">Loading...</p>
{/if}
