<script lang="ts">
  export let cards: Array<{ id?: string; type: App.CardType; title: string; content: string | number | null; percentile?: number | null; percentileDesc?: boolean | null; }>;
  import Card from './Card.svelte';
</script>

<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
  {#each cards as card}
    {#if card.content}
      <!-- デフォルト値を展開時に設定 -->
      <Card
        id={card.id}
        type={card.type}
        title={card.title} 
        content={card.content} 
        percentile={card.percentile ?? null} 
        percentileDesc={card.percentileDesc ?? false}
      />
    {/if}
  {/each}
</div>
