<script lang="ts">
  export let recentFriends: App.RecentFriend[];
</script>

<div class="flex gap-4 overflow-x-auto">
  {#each recentFriends as friend}
    <div class="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm min-w-[150px]">
      <a href={`/stats/${friend.handle}`} title="View Stats" class="block" data-sveltekit-reload>
        <img 
          src="{friend.avator ? friend.avator : '/avatar.png'}" 
          alt="{friend.handle}" 
          class="w-16 h-16 rounded-full mb-2 shadow-md hover:opacity-80 transition-opacity object-contain"
        />
      </a>
      <p class="text-sm font-semibold text-gray-700">
        <span class="text-gray-500">{friend.displayName || friend.handle}</span>
      </p>
      {#if friend.replyCount || friend.likeCount}
        <div class="text-xs text-gray-600 mt-2">
          {#if friend.replyCount}
            <span class="mr-2">
              <strong>{friend.replyCount}</strong> replies
            </span>
          {/if}
          {#if friend.likeCount}
            <span>
              <strong>{friend.likeCount}</strong> likes
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
