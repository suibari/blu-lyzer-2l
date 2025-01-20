<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';

  export let data: number[];

  onMount(() => {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Active Histogram',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      },
    });
  });
</script>

<div>
  <canvas id="barChart"></canvas>
</div>
