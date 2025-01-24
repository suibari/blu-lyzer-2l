<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import CardWide from '$lib/components/stats/CardWide.svelte';
  import CardGrid from '$lib/components/stats/CardGrid.svelte';
  import LineGraph from '$lib/components/stats/LineGraph.svelte';
  import BarGraph from '$lib/components/stats/BarGraph.svelte';
  import Profile from '$lib/components/stats/Profile.svelte';
  import type { AppBskyActorProfile } from '@atproto/api';
  import IcSharpShare from '$lib/components/icons/IcSharpShare.svelte';
  import { Spinner } from 'flowbite-svelte';

  let handle: string;
  let resultAnalyze: App.ResultAnalyze;
  let percentiles: App.Percentiles;
  let profile: AppBskyActorProfile.Record;
  let error: string | null = null;

  // ------------------------
  // fetch
  // ------------------------
  $: handle = page.params.handle;

  onMount(async () => {
    try {
      const res = await fetch(`/stats/${handle}`);
      if (res.ok) {
        const data = await res.json();
        resultAnalyze = data.resultAnalyze;
        percentiles = data.percentiles;
        profile = data.profile;
      } else {
        const errorData = await res.json();  // エラーメッセージを取得
        error = `Error fetching data: ${errorData.message || errorData.error || 'Unknown error'}`;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = `Error fetching data: ${err.message}`;
      }
    }
  });

  // ------------------------
  // web share API
  // ------------------------
  const shareResult = async () => {
    const shareText = `Check out the results for ${handle} on Bluesky Analysis!`;
    const shareUrl = `https://blu-lyzer.suibari.com/stats/${handle}`;

    if (navigator.share) {
      // Web Share API をサポートしている場合
      try {
        await navigator.share({
          title: "Bluesky Analysis",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      // フォールバック：Bluesky共有画面を新しいタブで開く
      const intentUrl = `https://bsky.app/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(intentUrl, "_blank");
    }
  };
</script>

{#if error}
  <p style="color: red;">{error}</p>
{:else if resultAnalyze}
  <div class="p-8 bg-gray-100 space-y-4">
    <!-- タイトルとシェアボタン -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-700">Result Analyze for {handle}</h2>
      <!-- シェアボタン -->
      <button
        on:click={shareResult}
        aria-label="Share"
        class="text-2xl p-2 rounded-full hover:bg-primary-900"
      >
        <IcSharpShare />
      </button>
    </div>

    <!-- Profile -->
    <Profile
      {profile}
      {resultAnalyze}
      {percentiles}
    />

    <!-- Recent Friends -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Relationship</h3>
      <CardWide
        title="Recent Friends"
        items={resultAnalyze.relationship.map((friend) => ({
          label: friend.displayName || '',
          img: friend.avator,
          handle: friend.handle,
          replies: friend.replyCount,
          likes: friend.likeCount
        }))}
      />
    </div>

    <!-- all activity -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">All Activity</h3>
      <CardGrid cards={[
        {
          type: "interval",
          title: 'Average Interval',
          content: resultAnalyze.activity.all.averageInterval,
          percentile: percentiles?.averageInterval,
        },
        {
          type: "date",
          title: 'Last Activity',
          content: resultAnalyze.activity.all.lastAt,
        },
      ]} />
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
          { 
            type: "interval",
            title: 'Avg Interval',
            content: resultAnalyze.activity.post.averageInterval,
            percentile: percentiles?.averagePostsInterval,
          },
          {
            type: "length",
            title: 'Avg Text Length',
            content: resultAnalyze.activity.post.averageLength,
            percentile: percentiles?.averageTextLength,
            percentileDesc: true,
          },
        ]}
      />
      
      {#if resultAnalyze.activity.post.wordFreqMap && resultAnalyze.activity.post.wordFreqMap.length > 0}
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
          {
            type: "interval",
            title: 'Avg Interval',
            content: resultAnalyze.activity.like.averageInterval,
            percentile: percentiles?.averageLikeInterval,
          },
          {
            type: "date",
            title: 'Last Activity',
            content: resultAnalyze.activity.like.lastAt
          },
        ]}
      />
    </div>
    
    <!-- Repost Activity -->
    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Repost Activity</h3>
      <CardGrid
        cards={[
          {
            type: "interval",
            title: 'Avg Interval',
            content: resultAnalyze.activity.repost.averageInterval,
            percentile: percentiles?.averageRepostInterval,
          },
          {
            type: "date",
            title: 'Last Activity',
            content: resultAnalyze.activity.repost.lastAt
          },
        ]}
      />
    </div>
    
    <!-- Last Updated -->
    <div class="p-4 text-right text-sm text-gray-500">
      <p>Last updated: {new Date(resultAnalyze.updatedAt).toLocaleString()}</p>
    </div>
  </div>

{:else}
  <div class="flex items-center justify-center w-full min-h-[calc(100vh-150px)]">
    <Spinner color="blue" size={12} class="text-center" />
  </div>
{/if}
