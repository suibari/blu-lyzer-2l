<script lang="ts">
  import { onMount } from "svelte";
  import { type ListEntry } from "wordcloud";
  import InfoWithTooltip from "../icons/InfoWithTooltip.svelte";

  interface Props {
    wordFreqMap: App.WordFreq[];
  }
  let { wordFreqMap }: Props = $props();

  let canvas: HTMLCanvasElement | null = $state(null);

  function normalizeSentimentScores(wordList: App.WordFreq[]): ListEntry[] {
    const minSentiment = Math.min(...wordList.map(w => w.sentimentScoreSum));
    const maxSentiment = Math.max(...wordList.map(w => w.sentimentScoreSum));
    
    // オフセットを加える
    const offset = minSentiment < 1 ? 1 - minSentiment : 0;

    // 最大値を50にスケーリング
    const maxAfterOffset = Math.max(...wordList.map(w => w.sentimentScoreSum + offset));
    const scale = maxAfterOffset > 0 ? 60 / maxAfterOffset : 0;

    return wordList.map(w => [
      w.noun, 
      (w.sentimentScoreSum + offset) * scale
    ]);
  }

  async function generateWordCloud() {
    if (!canvas || wordFreqMap.length === 0) return;
    const WordCloud = (await import("wordcloud")).default;
    const normalizedList = normalizeSentimentScores(wordFreqMap);

    WordCloud(canvas, {
      list: normalizedList,
      gridSize: 8,
      weightFactor: 2,
      fontFamily: "Arial",
      backgroundColor: "#fff",
      // colorオプションをコールバック関数として追加
      color: (word: string) => {
        const wordObj = wordFreqMap.find(w => w.noun === word);
        if (wordObj) {
          return wordObj.sentimentScoreSum > 0 ? 'green' : wordObj.sentimentScoreSum < 0 ? 'red' : 'gray';
        }
        return 'black';  // デフォルトの色
      }
    });
  }

  onMount(() => {
    generateWordCloud();
    resizeCanvas();
    // window.addEventListener("resize", resizeCanvas);
  });

  function resizeCanvas() {
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        generateWordCloud();
      }
    }
  }
</script>

{#if wordFreqMap.length > 0}
  <div class="p-4 bg-white shadow rounded-lg">
    <div class="flex items-center gap-2 mb-4">
      <h3 class="text-xl font-semibold text-gray-800">Word Cloud</h3>
      <InfoWithTooltip id="wordcloud_info" key_i18n="stats.word_cloud_info" />
    </div>
    <div class="relative w-full h-full">
      <canvas bind:this={canvas} class="w-full h-60"></canvas>
    </div>
  </div>
{/if}
