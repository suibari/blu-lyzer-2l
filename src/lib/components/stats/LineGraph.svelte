<script lang="ts">
  import { Chart } from 'chart.js/auto';
  import InfoWithTooltip from "../icons/InfoWithTooltip.svelte";

  interface Props {
    data: number[];
    centerZero: boolean;
  }
  let { data, centerZero = false }: Props = $props();

  let chartData = $state({data, centerZero});

  function chart(_p0: HTMLCanvasElement, datasets: Props) {
    let chartInstance: Chart;
    const node = document.getElementById('lineChart') as HTMLCanvasElement;

    function createChart(datasets: Props) {
      chartInstance = new Chart(node, {
        type: "line",
        data: {
          labels: datasets.data.map((_, i) => `${i}:00`), // 時間ラベル
          datasets: [
            {
              label: "Sentiment Heatmap",
              data: datasets.data,
              borderColor: "rgba(75, 192, 192, 0.6)",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: centerZero ? -Math.max(...datasets.data.map(Math.abs)) : undefined,
              max: centerZero ? Math.max(...datasets.data.map(Math.abs)) : undefined,
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

{#if data.find(d => d !== 0)}
  <div class="p-4 bg-white shadow rounded-lg">
    <div class="flex items-center gap-2 mb-4">
      <h3 class="text-xl font-semibold text-gray-800">Sentiment Heatmap</h3>
      <InfoWithTooltip id="sentimentHeatmap" key_i18n="stats.sentiment_heatmap_info" />
    </div>
    <div class="relative w-full h-64">
      <canvas id="lineChart" use:chart={$state.snapshot(chartData)}></canvas>
    </div>
  </div>
{/if}
