<script lang="ts">
  import { t } from '$lib/translations/translations';
  import InfoWithTooltip from '../icons/InfoWithTooltip.svelte';

  let {summary}: {summary: App.Summary} = $props();

  const sortedStats = Object.entries(summary).sort(([, a], [, b]) => b - a);
  const [mostSignificant, secondMostSignificant] = sortedStats;

  // 形容詞と名詞をランダムに取得
  const adjective = $t(`nickname.adjectives.${secondMostSignificant[0]}`);
  const adjectiveArray = adjective.split("|");
  const randomAdjective = adjectiveArray[Math.floor(Math.random() * adjectiveArray.length)];

  const nouns = $t(`nickname.nouns.${mostSignificant[0]}`);
  const nounArray = nouns.split("|");
  const randomNoun = nounArray[Math.floor(Math.random() * nounArray.length)];

  const emoji = $t(`nickname.emoji.${mostSignificant[0]}`);
</script>

<div class="w-full p-4 mt-8 bg-gray-100 text-center rounded-lg space-y-2">
  <div class="w-full flex justify-center items-center gap-2">
    <p>{$t("stats.nickname_title")}</p>
    <InfoWithTooltip id="nickname" key_i18n="stats.nickname_info" />
  </div>
  <p class="text-2xl sm:text-3xl md:text-5xl text-gray-600 font-bold mb-2 dela-gothic">
    <span id="randomAdjective" class="block sm:inline">{randomAdjective}</span>
    <span id="randomNounEmoji" class="block sm:inline">{randomNoun}{emoji}</span>
  </p>
</div>
