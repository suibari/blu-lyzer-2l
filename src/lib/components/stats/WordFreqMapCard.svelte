<script lang="ts">
  export let wordFreqMap: App.WordFreq[];
</script>

<div class="flex gap-4 overflow-x-auto">
  {#each wordFreqMap as word}
    <div class="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm min-w-[150px]">
      <p class="text-sm font-semibold text-gray-700">
        <span class="text-gray-500">{word.noun}:</span> {word.count}
      </p>
    </div>
  {/each}
</div>
