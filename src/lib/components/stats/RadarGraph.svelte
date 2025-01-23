<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';
    import { number } from 'zod';

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
            'Influencer',
            'Morning Person',
            'Night Owl',
            'Positivity',
            'Posting Freq',
            'Liking Freq',
            'Repost Freq',
            'Long-Post Freq',
          ],
          datasets: [
            {
              label: 'User Profile',
              data: [
                calculateInfluencer(profile.followsCount, profile.followersCount),
                calculateMorningPerson(activityHeatmap),
                calculateNightPerson(activityHeatmap),
                calculateSentimentTotal(sentimentHeatmap),
                percentiles.averagePostsInterval,
                percentiles.averageLikeInterval,
                percentiles.averageRepostInterval,
                100 - percentiles.averageTextLength,
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
              position: 'top',
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
  if (followsCount === 0) {
    return followersCount > 0 ? 100 : 0; // フォローが0のときの特例処理
  }

  // フォロワー数とフォロー数の比率を計算
  const ratio = followersCount / followsCount;

  // スコアを50を基準にして計算し、倍率に応じて値を調整
  const influence = 50 + (Math.log10(ratio) * 25);

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
    const sentimentSumConv =  sentimentSum * 100 + 50;

    return (sentimentSumConv > 100) ? 100 : (sentimentSumConv < 0) ? 0 : sentimentSumConv;
  }

</script>

<div class="w-full h-64">
  <canvas id="radarChart"></canvas>
</div>
