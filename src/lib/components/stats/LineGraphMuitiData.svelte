<script lang="ts">
  import { Chart } from 'chart.js/auto';
  import InfoWithTooltip from "../icons/InfoWithTooltip.svelte";
  import { t } from '$lib/translations/translations';

  interface Dataset {
    label: string;
    data: number[];
  }

  interface Props {
    datasets: Dataset[];
    peakActivityHour: number | null
  }

  let { datasets, peakActivityHour }: Props = $props();

  function chart(node: HTMLCanvasElement, datasets: Props) {
    let chartInstance: Chart;

    function createChart(datasets: Props) {
      chartInstance = new Chart(node, {
        type: "line",
        data: {
          labels: datasets.datasets[0]?.data.map((_, i) => `${i}:00`) || [],
          datasets: datasets.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            // borderColor: ds.borderColor,
            fill: true,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
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

{#if datasets.some(d => d.data.some(v => v !== 0))}
  <div class="p-4 bg-white shadow rounded-lg mt-4">
    <div class="flex items-center gap-2 mb-4">
      <h3 class="text-xl font-semibold text-gray-800">Friends Activity</h3>
      <InfoWithTooltip id="friendsActivityHeatmap" key_i18n="stats.friends_activity_info" />
    </div>
    <div class="relative w-full h-96">
      <canvas id="lineChartMulti" use:chart={$state.snapshot({ datasets, peakActivityHour })}></canvas>
    </div>
    {#if peakActivityHour}
      <div class="flex-col w-full mt-2 text-center text-l text-gray-900 space-y-1">
        <p>{$t("stats.friends_activity_0")}</p>
        <p class="font-semibold text-xl">{peakActivityHour-1}~{peakActivityHour+1}{$t("stats.friends_activity_1")}</p>
        <p>{$t("stats.friends_activity_2")}</p>
      </div>
    {/if}
  </div>
{/if}
