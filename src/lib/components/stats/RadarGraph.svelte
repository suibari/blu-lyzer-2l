<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { t } from '$lib/translations/translations';
  import { Tooltip, Button } from 'flowbite-svelte';

  // Chart.js のモジュールを登録
  Chart.register(...registerables);

  export let profile;
  export let activityHeatmap;
  export let sentimentHeatmap;
  export let percentiles;

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
            $t('stats.radar_night_owl'),
            $t('stats.radar_positivity'),
            $t('stats.radar_posting_freq'),
            $t('stats.radar_liking_freq'),
            $t('stats.radar_repost_freq'),
            $t('stats.radar_longpost_freq'),
          ],
          datasets: [
            {
              label: 'User Profile',
              data: [
                calculateInfluencer(profile.followsCount, profile.followersCount),
                calculateMorningPerson(activityHeatmap),
                calculateNightPerson(activityHeatmap),
                calculateSentimentTotal(sentimentHeatmap),
                100 - percentiles.averagePostsInterval || 0,
                100 - percentiles.averageLikeInterval || 0,
                100 - percentiles.averageRepostInterval || 0,
                100 - percentiles.averageTextLength || 0,
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
          maintainAspectRatio: true,
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

  function calculateInfluencer(followsCount: number, followersCount: number): number {
  // フォロワー数とフォロー数の比率を計算
  const ratioBias = (followersCount / (followsCount + 1));

  // フォロワー数のスケールに基づくバイアス（logスケールで調整）
  const followerBias = Math.log10(followersCount + 1) * 8; // +1で0フォロワー時の対数回避

  // スコアを50を基準に計算し、比率とフォロワーバイアスを組み合わせ
  const influence = (ratioBias ) + (followerBias);

  // 最小0、最大100に制限
  return Math.min(Math.max(influence, 0), 100);
}

  /**
   * Morning Person スコアを計算する関数
   * @param activityInterval - 時間ごとのアクティビティデータ（24要素の配列）
   * @returns 朝型スコア (0~100)
   */
  function calculateMorningPerson(activityInterval: number[]): number {
    if (activityInterval.length !== 24) {
      throw new Error("activityInterval must contain exactly 24 elements.");
    }

    const morningSum = activityInterval.slice(0, 12).reduce((acc, curr) => acc + curr, 0); // 0時〜11時の合計
    const nightSum = activityInterval.slice(12, 24).reduce((acc, curr) => acc + curr, 0); // 12時〜23時の合計

    const total = morningSum + nightSum;
    if (total === 0) return 0; // アクティビティが全くない場合の処理

    return Math.round((morningSum / total) * 100);
  }

  /**
   * Night Owl スコアを計算する関数
   * @param activityInterval - 時間ごとのアクティビティデータ（24要素の配列）
   * @returns 夜型スコア (0~100)
   */
  function calculateNightPerson(activityInterval: number[]): number {
    if (activityInterval.length !== 24) {
      throw new Error("activityInterval must contain exactly 24 elements.");
    }

    const morningSum = activityInterval.slice(0, 12).reduce((acc, curr) => acc + curr, 0); // 0時〜11時の合計
    const nightSum = activityInterval.slice(12, 24).reduce((acc, curr) => acc + curr, 0); // 12時〜23時の合計

    const total = morningSum + nightSum;
    if (total === 0) return 0; // アクティビティが全くない場合の処理

    return Math.round((nightSum / total) * 100);
  }

  function calculateSentimentTotal(sentimentHeatmap: number[]): number {
    if (sentimentHeatmap.length !== 24) {
      throw new Error("sentimentHeatmap must contain exactly 24 elements.");
    }

    const sentimentSum = sentimentHeatmap.reduce((acc, curr) => acc + curr, 0);
    const sentimentSumConv =  sentimentSum * 50 + 50;

    return (sentimentSumConv > 100) ? 100 : (sentimentSumConv < 0) ? 0 : sentimentSumConv;
  }

</script>

<div class="w-full h-full">
  <canvas id="radarChart"></canvas>
</div>

<Tooltip triggeredBy="#radarChart">{$t("stats.radar_info")}</Tooltip>
