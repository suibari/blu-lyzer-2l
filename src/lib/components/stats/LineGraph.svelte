<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart } from 'chart.js/auto';

  export let data: number[];
  export let centerZero: boolean = false;

  let chart: Chart | null = null;

  onMount(() => {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    chart = new Chart(ctx, {
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
        responsive: true,
        maintainAspectRatio: false, // アスペクト比を無視
        scales: {
          y: {
            beginAtZero: false,
            min: centerZero ? -Math.max(...data.map(Math.abs)) : undefined, // 最小値
            max: centerZero ? Math.max(...data.map(Math.abs)) : undefined,  // 最大値
          },
        },
      },
    });

    // クリーンアップ処理
    onDestroy(() => {
      if (chart) {
        chart.destroy();
      }
    });
  });
</script>

{#if data.find(d => d !== 0)}
  <div class="p-4 bg-white shadow rounded-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">Sentiment Heatmap</h3>
    <div class="relative w-full h-64"> <!-- 親要素のサイズに合わせる -->
      <canvas id="lineChart"></canvas>
    </div>
  </div>
{/if}
