<script lang="ts">
  import RadarGraph from "./RadarGraph.svelte";
  import Nickname from "./Nickname.svelte"; // 横長のコンポーネントをインポート
  import {
    calculateInfluencer,
    calculateMorningPerson,
    calculateNightPerson,
    calculatePercentileToPoint,
    calculateSentimentTotal,
  } from "./calcurateProfile";

  export let profile: App.ProfileExt;
  export let activityHeatmap: number[];
  export let sentimentHeatmap: number[];
  export let percentiles: App.Percentiles;

  const influencer = calculateInfluencer(profile.followsCount, profile.followersCount);
  const morningPerson = calculateMorningPerson(activityHeatmap);
  const nightOwl = calculateNightPerson(activityHeatmap);
  const positivity = calculateSentimentTotal(sentimentHeatmap);
  const postingFreq = calculatePercentileToPoint(percentiles.averagePostsInterval);
  const likingFreq = calculatePercentileToPoint(percentiles.averageLikeInterval || 0);
  const repostFreq = calculatePercentileToPoint(percentiles.averageRepostInterval || 0);
  const longpostFreq = calculatePercentileToPoint(percentiles.averageTextLength);
</script>

<div class="w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
  <!-- Top Section: Profile + Radar Chart -->
  <div class="flex flex-col md:flex-row">
    <!-- Left side: Profile -->
    <div class="flex flex-col items-start md:w-1/2 sm:w-full">
      <div class="flex items-center mb-4">
        <a href="https://bsky.app/profile/{profile.handle}" target="_blank" >
          <img
            src={String(profile.avatar) || '/avatar.png'}
            alt="Avatar"
            class="w-16 h-16 rounded-full border-2 border-gray-300 mr-4 object-contain"
          />
        </a>
        <h2 class="text-2xl font-semibold text-gray-800">{profile.displayName ? profile.displayName : profile.handle}</h2>
      </div>
      <p class="text-md text-gray-600 whitespace-pre-wrap">{profile.description}</p>
    </div>

    <!-- Right side: Radar Chart -->
    <div class="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8">
      <div class="w-full h-full border border-gray-300 rounded-lg">
        {#if profile && activityHeatmap && sentimentHeatmap && percentiles}
          <RadarGraph
            {influencer}
            {morningPerson}
            {nightOwl}
            {positivity}
            {postingFreq}
            {likingFreq}
            {repostFreq}
            {longpostFreq}
          />
        {/if}
      </div>
    </div>
  </div>

  <!-- Bottom Section: Simple Ranking -->
  <div class="w-full mt-6">
    <Nickname
      {influencer}
      {morningPerson}
      {nightOwl}
      {positivity}
      {postingFreq}
      {likingFreq}
      {repostFreq}
      {longpostFreq}
    />
  </div>
</div>
