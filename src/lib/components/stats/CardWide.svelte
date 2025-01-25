<script lang="ts">
  import InfoWithTooltip from "../icons/InfoWithTooltip.svelte";
  import RecentFriendsCard from './RecentFriendsCard.svelte';
  import WordFrequencyCard from './WordFreqMapCard.svelte';

  export let title: string;
  export let id: string;
  export let recentFriends: App.RecentFriend[] | undefined;
  export let wordFreqMap: App.wordFreq[] | undefined;
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <div class="flex items-center gap-2 mb-4">
    <h3 class="text-xl font-semibold text-gray-800">{title}</h3>
    <InfoWithTooltip {id} key_i18n={`stats.${id}_info`} />
  </div>
  {#if recentFriends}
    <RecentFriendsCard {recentFriends} />
  {/if}
  {#if wordFreqMap}
    <WordFrequencyCard {wordFreqMap} />
  {/if}
</div>
