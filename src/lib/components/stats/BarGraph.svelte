<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart } from 'chart.js/auto';

  export let data: number[];

  let chart: Chart | null = null;

  onMount(() => {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    chart = new Chart(ctx, {
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
      options: {
        responsive: true,
        maintainAspectRatio: false, // アスペクト比を無視する
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // コンポーネントが破棄されるときにチャートを削除
    onDestroy(() => {
      if (chart) {
        chart.destroy();
      }
    });
  });
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <h3 class="text-xl font-semibold text-gray-800 mb-4">Active Heatmap</h3>
  <div class="relative w-full h-64"> <!-- 親要素の高さを明示的に設定 -->
    <canvas id="barChart"></canvas>
  </div>
</div>
