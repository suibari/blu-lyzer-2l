<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';

  export let data: number[];
  export let centerZero: boolean = false;

  onMount(() => {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Sentiment Heatmap',
            data: data,
            borderColor: 'rgba(75, 192, 192, 0.6)',
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            min: centerZero ? -Math.max(...data.map(Math.abs)) : undefined, // 最小値 (負の最大絶対値)
            max: centerZero ? Math.max(...data.map(Math.abs)) : undefined,  // 最大値 (正の最大絶対値)
          },
        },
      },
    });
  });
</script>

<div>
  <canvas id="lineChart"></canvas>
</div>
