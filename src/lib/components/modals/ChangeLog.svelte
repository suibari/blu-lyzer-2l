<script>
	import { Modal } from 'flowbite-svelte';
  import { changelog } from './config/changelog';

  export let changeLogModal = false;
  export const LATEST_VER = changelog[0].version;
</script>

<Modal title="よくある質問" bind:open={changeLogModal} autoclose outsideclose>
	<div>
    {#each changelog as cl}
      <h1 class="text-xl font-bold">{cl.version}</h1>
      {#each cl.changes as desc}
        <p>{@html desc}</p>  
      {/each}
    {/each}
	</div>
</Modal>
