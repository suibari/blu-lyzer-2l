<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import CardWide from '$lib/components/stats/CardWide.svelte';
  import CardGrid from '$lib/components/stats/CardGrid.svelte';
  import LineGraph from '$lib/components/stats/LineGraph.svelte';
  import BarGraph from '$lib/components/stats/BarGraph.svelte';
  import Profile from '$lib/components/stats/Profile.svelte';
  import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
  import IcSharpShare from '$lib/components/icons/IcSharpShare.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import { t } from '$lib/translations/translations';
  import type { PageProps } from './$types';
  import { Alert } from 'flowbite-svelte';
  import IcBaselineInfo from '$lib/components/icons/IcBaselineInfo.svelte';
  import LineGraphMuitiData from '$lib/components/stats/LineGraphMuitiData.svelte';
  import WordCloud from '$lib/components/stats/WordCloud.svelte';

  // for dynamic OGP
  let { data }: PageProps = $props();

  let displayName = $state(data?.meta.displayName);
  let ogTitle = $state(data?.meta.ogTitle);
  let ogImage = $state(data?.meta.ogImage);
  let ogUrl = $state(data?.meta.ogUrl);
  const title = `${displayName}${$t("stats.ogp_title")} | Blu-lyzer`;

  let timeZone: string;

  // fetch
  let handle: string = $state("");
  let resultAnalyze: App.ResultAnalyze | null = $state(null);
  let summary: App.Summary = $state({} as App.Summary);
  let percentiles: App.Percentiles = $state({} as App.Percentiles);
  let profile: ProfileViewDetailed = $state({} as ProfileViewDetailed);
  let configInvisible: App.ConfigInvisible = $state({} as App.ConfigInvisible);
  let error: string | null = $state(null);

  // ------------------------
  // fetch result summary
  // ------------------------
  $effect(() => {handle = page.params.handle});

  onMount(async () => {
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`/stats/${handle}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({timeZone})
      });
      if (res.ok) {
        const data = await res.json();
        resultAnalyze = data.resultAnalyze;
        console.log(resultAnalyze?.relationship)
        summary = data.summary;
        percentiles = data.percentiles;
        profile = data.profile;
        configInvisible = data.configInvisible;
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
    const shareUrl = `https://blu-lyzer.suibari.com/stats/${handle}`
    const shareTextBase = String($t("stats.share_text"));
    const shareTextReplaced = shareTextBase
      .replace('${displayName}', profile.displayName || "Unknown User")
      .replace('${randomAdjective}', document.getElementById('randomAdjective')?.innerText || "Unknown")
      .replace('${randomNounEmoji}', document.getElementById('randomNounEmoji')?.innerText || "User");
    const shareText = shareTextReplaced + ` ${shareUrl}`;

    if (navigator.share) {
      // Web Share API をサポートしている場合
      try {
        await navigator.share({
          title: "Bluesky Analysis",
          text: shareText,
          // url: shareUrl, // URLが優先され、textが無視されることが多い
        });
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      // フォールバック：Bluesky共有画面を新しいタブで開く
      const intentUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`;
      window.open(intentUrl, "_blank");
    }
  };

  // ------------------------
  // Util
  // ------------------------
  function getPeakFriendsActivityHour(resultAnalyze: App.ResultAnalyze): number | null {
    if (!resultAnalyze.relationship) return null;

    // 各時間帯(0-23)の合計を格納する配列
    const totalHeatmap = Array(24).fill(0);

    // 各relationshipのactionHeatmapを合算
    for (const friend of resultAnalyze.relationship) {
      const heatmap = friend.resultAnalyze?.activity.all.actionHeatmap;
      if (Array.isArray(heatmap) && heatmap.length === 24) {
        for (let i = 0; i < 24; i++) {
          totalHeatmap[i] += heatmap[i] ?? 0; // undefinedなら0を加算
        }
      }
    }

    // 最も多いアクションが発生したインデックス（時間帯）を求める
    const maxIndex = totalHeatmap.indexOf(Math.max(...totalHeatmap));

    return maxIndex; // 0〜23の値が返る（最もアクティブな時間）
  }

  const requiredKeys: Array<keyof App.Percentiles> = [
    "averageInterval",
    "averagePostsInterval",
    "averageTextLength",
    "averageLikeInterval",
    "averageRepostInterval",
    "averageReplyInterval",
  ];

  function isValidPercentiles(obj: any): obj is App.Percentiles {
    return obj && requiredKeys.every(key => key in obj && typeof obj[key] === "number");
  }
</script>

{#if error}
  <p style="color: red;">{error}</p>
{:else if resultAnalyze}
  <div class="p-8 bg-gray-100 space-y-4">
    <!-- タイトルとシェアボタン -->
    <div class="flex items-center justify-between mb-6 flex-wrap">
      <h2 class="w-3/4 text-2xl font-bold text-gray-700 break-words">@{handle}'s Stats in Bluesky</h2>
      <!-- シェアボタン -->
      <button
        onclick={shareResult}
        aria-label="Share"
        class="text-2xl p-2 rounded-full hover:bg-primary-900"
      >
        <IcSharpShare />
      </button>
    </div>

    <!-- Profile -->
    <Profile
      {profile}
      {summary}
    />

    <!-- Alert -->
    {#if configInvisible.allHeatmap}
      <div class="w-full">
        <Alert color="yellow">
          <div class="flex items-center">
          <IcBaselineInfo class="mr-4 text-xl w-12" />
          <div class="flex-col">
            <p>{$t("stats.invisible_info_all_0")}</p>
            <p>{$t("stats.invisible_info_all_1")}</p>
          </div>
          </div>
        </Alert>
      </div>
    {/if}
    {#if configInvisible.friendsHeatmap}
    <div class="w-full">
      <Alert color="yellow">
        <div class="flex items-center">
        <IcBaselineInfo class="mr-4 text-xl w-12" />
        <div class="flex-col">
          <p>{$t("stats.invisible_info_friends_activity_0")}</p>
          <p>{$t("stats.invisible_info_friends_activity_1")}</p>
        </div>
        </div>
      </Alert>
    </div>
  {/if}
  {#if !isValidPercentiles(percentiles)}
    <div class="w-full">
      <Alert color="green">
        <div class="flex items-center">
        <IcBaselineInfo class="mr-4 text-xl w-12" />
        <div class="flex-col">
          <p>{$t("stats.percentiles_alert_0")}</p>
        </div>
        </div>
      </Alert>
    </div>
  {/if}

    <!-- Recent Friends -->
    <div>
      {#if resultAnalyze.relationship}
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Relationship</h3>
        <CardWide
          id="recentfriends"
          title="Recent Friends"
          recentFriends={resultAnalyze.relationship}
          wordFreqMap={undefined}
        />
        <LineGraphMuitiData
          datasets={resultAnalyze.relationship.slice(0, 10).map((friend, index) => ({
            data: friend.resultAnalyze?.activity.all.actionHeatmap || Array(24),
            label: friend.displayName || `No Name` // 名前がない場合のデフォルト
          })).filter(dataset => dataset.data)}
          peakActivityHour={getPeakFriendsActivityHour(resultAnalyze)}
        />
      {/if}
    </div>

    <!-- all activity -->
    <div class="space-y-4">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">All Activity</h3>
      <CardGrid cards={[
        {
          id: "avarageAllInterval",
          type: "interval",
          title: 'Avg Interval',
          content: resultAnalyze.activity.all.averageInterval,
          percentile: percentiles?.averageInterval,
        },
        {
          type: "date",
          title: 'Last Activity',
          content: resultAnalyze.activity.all.lastAt,
        },
      ]} />
      {#if resultAnalyze.activity.post.actionHeatmap && resultAnalyze.activity.like.actionHeatmap && resultAnalyze.activity.repost.actionHeatmap}
        <BarGraph
          postData={resultAnalyze.activity.post.actionHeatmap}
          replyData={resultAnalyze.activity.post.reply.actionHeatmap || Array(24)}
          likeData={resultAnalyze.activity.like.actionHeatmap}
          repostData={resultAnalyze.activity.repost.actionHeatmap}
        />
      {/if}
    </div>
    
    <!-- Post Activity -->
    <div class="space-y-4">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Post Activity</h3>
      <CardGrid
        cards={[
          {
            id: "avaragePostInterval",
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
          {
            type: "date",
            title: 'Last Activity',
            content: resultAnalyze.activity.post.lastAt,
          },
        ]}
      />
      
      {#if resultAnalyze.activity.post.sentimentHeatmap}
        <LineGraph data={resultAnalyze.activity.post.sentimentHeatmap} centerZero={true} />
      {/if}

      {#if resultAnalyze.activity.post.wordFreqMap && resultAnalyze.activity.post.wordFreqMap.length > 0}
        <CardWide
          id="wordfreq"
          title="Word Frequencies"
          recentFriends={undefined}
          wordFreqMap={resultAnalyze.activity.post.wordFreqMap}
        />
        <WordCloud wordFreqMap={resultAnalyze.activity.post.wordFreqMap} />
      {/if}
    </div>

    <!-- Reply Activity -->
    {#if resultAnalyze.activity.post.reply}
      <div>
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Reply Activity</h3>
        <CardGrid
          cards={[
            {
              id: "avarageReplyInterval",
              type: "interval",
              title: 'Avg Interval',
              content: resultAnalyze.activity.post.reply.averageInterval || null,
              percentile: percentiles?.averageReplyInterval,
            },
            {
              type: "date",
              title: 'Last Activity',
              content: resultAnalyze.activity.post.reply.lastAt || null
            },
          ]}
        />
      </div>
    {/if}

    <!-- Like Activity -->
    <div>
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Like Activity</h3>
      <CardGrid
        cards={[
          {
            id: "avarageLikeInterval",
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
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Repost Activity</h3>
      <CardGrid
        cards={[
          {
            id: "avarageRepostInterval",
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
  <Spinner />
{/if}

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content={ogTitle} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:url" content={ogUrl} />
  <meta property="og:type" content="website" />
</svelte:head>
