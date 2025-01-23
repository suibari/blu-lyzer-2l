<script lang="ts">
  import type { AppBskyActorProfile } from "@atproto/api";
    import RadarGraph from "./RadarGraph.svelte";

  export let profile: AppBskyActorProfile.Record;
  export let resultAnalyze: App.ResultAnalyze;
  export let percentiles;
</script>

<div class="w-full mx-auto p-6 bg-white shadow-lg rounded-lg flex flex-col md:flex-row">
  <!-- Left side: Profile -->
  <div class="flex flex-col items-start md:w-1/2 sm:w-full">
    <!-- Avatar and DisplayName -->
    <div class="flex items-center mb-4">
      <img src={String(profile.avatar)} alt="Avatar" class="w-16 h-16 rounded-full border-2 border-gray-300 mr-4" />
      <h2 class="text-2xl font-semibold text-gray-800">{profile.displayName}</h2>
    </div>

    <!-- Profile Description -->
    <p class="text-md text-gray-600 whitespace-pre-wrap">{profile.description}</p>
  </div>

  <!-- Right side: Radar Chart -->
  <div class="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8">
    <div class="w-full h-full border border-gray-300 rounded-lg">
      <RadarGraph
        {profile}
        activityHeatmap={resultAnalyze.activity.all.actionHeatmap}
        sentimentHeatmap={resultAnalyze.activity.post.sentimentHeatmap}
        {percentiles}
      />
    </div>
  </div>
</div>
