<script lang="ts">
  import InfoWithTooltip from "../icons/InfoWithTooltip.svelte";

  export let title: string;
  export let id: string;
  export let items: Array<{
    img?: string;
    label: string;
    value?: string | number;
    handle?: string;
    replies?: number; // 返信数
    likes?: number; // いいね数
  }>;
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <div class="flex items-center gap-2 mb-4">
    <h3 class="text-xl font-semibold text-gray-800">{title}</h3>
    <InfoWithTooltip {id} key_i18n={`stats.${id}_info`} />
  </div>
  <div class="flex gap-4 overflow-x-auto">
    {#each items as item}
      <div class="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm min-w-[150px]">
        {#if item.img}
          <a href={`/stats/${item.handle}`} title="View Stats" class="block" data-sveltekit-reload>
            <img 
              src="{item.img}" 
              alt="{item.label}" 
              class="w-16 h-16 rounded-full mb-2 shadow-md hover:opacity-80 transition-opacity"
            />
          </a>
        {/if}
        {#if item.value}
          <p class="text-sm font-semibold text-gray-700">
            <span class="text-gray-500">{item.label}:</span> {item.value}
          </p>
        {:else}
          <p class="text-sm font-semibold text-gray-700">
            <span class="text-gray-500">{item.label}</span>
          </p>
        {/if}
        {#if item.replies || item.likes}
          <div class="text-xs text-gray-600 mt-2">
            {#if item.replies}
              <span class="mr-2">
                <strong>{item.replies}</strong> replies
              </span>
            {/if}
            {#if item.likes}
              <span>
                <strong>{item.likes}</strong> likes
              </span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
