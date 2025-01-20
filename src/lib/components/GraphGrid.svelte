<script lang="ts">
  import LineGraph from './LineGraph.svelte';
  import BarGraph from './BarGraph.svelte';

  export let activeHistgram: number[];
  export let sentimentHeatmap: number[];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Active Histogram -->
  <div class="p-4 bg-white shadow rounded-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">Active Heatmap</h3>
    <BarGraph data={activeHistgram} />
  </div>

  <!-- Sentiment Heatmap -->
  <div class="p-4 bg-white shadow rounded-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">Sentiment Heatmap</h3>
    <LineGraph data={sentimentHeatmap} centerZero={true} />
  </div>
</div>
