<script lang="ts">
  export let title: string;
  export let items: Array<{
    img?: string;
    label: string;
    value: string | number;
    handle?: string;
  }>;
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <h3 class="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
  <div class="flex gap-4 overflow-x-auto">
    {#each items as item}
      <div class="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm min-w-[150px]">
        {#if item.img}
          <a href={`/stats/${item.handle}`} title="View Stats" class="block" data-sveltekit-reload >
            <img 
              src="{item.img}" 
              alt="{item.label}" 
              class="w-16 h-16 rounded-full mb-2 shadow-md hover:opacity-80 transition-opacity"
            />
          </a>
        {/if}
        <p class="text-sm font-semibold text-gray-700">
          <span class="text-gray-500">{item.label}:</span> {item.value}
        </p>
      </div>
    {/each}
  </div>
</div>
