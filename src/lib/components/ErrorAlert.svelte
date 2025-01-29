<script>
  import { Alert } from "flowbite-svelte";

  export let flag = false;
  export let errorMessage = "An error occurred"; // デフォルトのエラーメッセージ
</script>

{#if flag}
  <div class="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-screen flex justify-center">
    <div class="w-11/12">
      <Alert color="red" dismissable on:close={() => flag = false}>
        {errorMessage}
      </Alert>
    </div>
  </div>
{/if}
