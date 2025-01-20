<script lang="ts">
  export let recentFriends: Array<{ did: string; score: number }>;
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <h3 class="text-xl font-semibold text-gray-800 mb-4">Recent Friends</h3>
  <div class="flex gap-4 overflow-x-auto">
    {#each recentFriends as friend}
      <div class="flex flex-col items-start bg-gray-100 p-4 rounded-lg shadow-sm min-w-[150px]">
        <p class="text-sm font-semibold text-gray-700">
          <span class="text-gray-500">DID:</span> {friend.did}
        </p>
        <p class="text-sm font-semibold text-gray-700">
          <span class="text-gray-500">Score:</span> {friend.score}
        </p>
      </div>
    {/each}
  </div>
</div>
