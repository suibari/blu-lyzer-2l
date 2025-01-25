<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import InfoWithTooltip from '../icons/InfoWithTooltip.svelte';

  export let postData: number[];  // Post に関するデータ
  export let likeData: number[];  // Like に関するデータ
  export let repostData: number[]; // Repost に関するデータ

  let chart: Chart | null = null;

  onMount(() => {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: postData.map((_, i) => `${i}:00`), // 例: 時間帯
        datasets: [
          {
            label: 'Posts',
            data: postData,
            backgroundColor: 'rgba(54, 162, 235, 0.6)', // 青
          },
          {
            label: 'Likes',
            data: likeData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)', // 緑
          },
          {
            label: 'Reposts',
            data: repostData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)', // 赤
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top', // 凡例を上部に配置
          },
        },
        scales: {
          x: {
            stacked: true, // X軸を積み上げ表示に設定
          },
          y: {
            beginAtZero: true,
            stacked: true, // Y軸も積み上げ表示に設定
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
  <div class="flex items-center gap-2 mb-4">
    <h3 class="text-xl font-semibold text-gray-800">Active Heatmap</h3>
    <InfoWithTooltip id="activeHeatmap" key_i18n="stats.active_heatmap_info" />
  </div>
  <div class="relative w-full h-64">
    <canvas id="barChart"></canvas>
  </div>
</div>
