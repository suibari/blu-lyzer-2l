<script lang="ts">
  export let cards: Array<{ title: string; content: string | number | null }>;
  import Card from './Card.svelte';
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {#each cards as card}
    <Card {...card} />
  {/each}
</div>
