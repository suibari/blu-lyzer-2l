<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { t } from '$lib/translations/translations';
  import { Tooltip, Button } from 'flowbite-svelte';

  // Chart.js のモジュールを登録
  Chart.register(...registerables);

  let {summary}: {summary: App.Summary} = $props()

  let chart: Chart | null = null;

  onMount(() => {
    const ctx = document.getElementById('radarChart') as HTMLCanvasElement;

    if (ctx) {
      chart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: [
            $t('stats.radar_influencer'),
            $t('stats.radar_morning_person'),
            $t('stats.radar_positivity'),
            $t('stats.radar_posting_freq'),
            $t('stats.radar_liking_freq'),
            $t('stats.radar_repost_freq'),
            $t('stats.radar_longpost_freq'),
            $t('stats.radar_reply_freq'),
          ],
          datasets: [
            {
              label: 'User Profile',
              data: [
                summary.influencer,
                summary.morningPerson,
                summary.positivity,
                summary.postingFreq,
                summary.likingFreq,
                summary.repostFreq,
                summary.longpostFreq,
                summary.replyFreq,
              ],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            r: {
              min: 0, // 最小値を0に設定
              suggestedMax: 100, // 最大値の目安を設定
              ticks: {
                stepSize: 20, // ラベルのステップを指定（任意）
              },
            },
          },
        },
      });
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<div class="w-full h-48 md:h-96">
  <canvas id="radarChart"></canvas>
</div>

<Tooltip triggeredBy="#radarChart">{$t("stats.radar_info")}</Tooltip>
