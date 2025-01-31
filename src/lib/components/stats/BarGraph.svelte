<script lang="ts">
  import { Chart } from 'chart.js/auto';
  import InfoWithTooltip from '../icons/InfoWithTooltip.svelte';

  interface Props {
    postData: number[];
    replyData: number[];
    likeData: number[];
    repostData: number[];
  }
  let { postData, replyData, likeData, repostData }: Props = $props();

  let chartData = $state({ postData, replyData, likeData, repostData });

  function chart(_p0: HTMLCanvasElement, datasets: Props) {
    let chartInstance: Chart;
    const node = document.getElementById('barChart') as HTMLCanvasElement;

    function createChart(datasets: Props) {
      const postDataWithoutReplies = datasets.postData.map(
        (value, index) => value - datasets.replyData[index]
      ); // replyDataを減算したpostData

      chartInstance = new Chart(node, {
        type: "bar",
        data: {
          labels: datasets.postData.map((_, i) => `${i}:00`), // 時間ラベル
          datasets: [
            {
              label: "Posts (Not Replies)",
              data: postDataWithoutReplies,
              backgroundColor: "rgba(54, 162, 235, 0.6)", // 青
            },
            {
              label: "Replies",
              data: datasets.replyData,
              backgroundColor: "rgba(255, 159, 64, 0.6)", // オレンジ
            },
            {
              label: "Likes",
              data: datasets.likeData,
              backgroundColor: "rgba(75, 192, 192, 0.6)", // 緑
            },
            {
              label: "Reposts",
              data: datasets.repostData,
              backgroundColor: "rgba(255, 99, 132, 0.6)", // 赤
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              beginAtZero: true,
              stacked: true,
            },
          },
        },
      });
    }

    createChart(datasets);

    return {
      update(newData: Props) {
        chartInstance.destroy();
        createChart(newData);
      },
      destroy() {
        chartInstance.destroy();
      },
    };
  }
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <div class="flex items-center gap-2 mb-4">
    <h3 class="text-xl font-semibold text-gray-800">Active Heatmap</h3>
    <InfoWithTooltip id="activeHeatmap" key_i18n="stats.active_heatmap_info" />
  </div>
  <div class="relative w-full h-64">
    <canvas id="barChart" use:chart={$state.snapshot(chartData)}></canvas>
  </div>
</div>
