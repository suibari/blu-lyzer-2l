<script lang="ts">
  import { goto } from '$app/navigation';

  export let LATEST_VER = "";

  let handle = ""; // 入力フォーム用変数

  const handleSubmit = (event: Event) => {
    event.preventDefault(); // ページリロードを防ぐ
    if (handle.trim()) {
      goto(`/stats/${handle.trim()}`); // `/stats/[handle]` へ遷移
    }
  };
</script>

<div class="container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center items-center text-primary-800">
  <div class="title font-orbitron text-6xl mb-4">Blu-lyzer</div>

  <div class="font-orbitron text-xl mb-4">{LATEST_VER}</div>

  <div class="description text-md md:text-lg w-3/4 md:w-full mx-auto mb-6">
    <p>Blu-lyzer is a Bluesky post analysis tool.</p>
    <p>No login or installation required.</p>
    <p>Enter your Bluesky handle (without "@")!</p>
  </div>

  <!-- Input Form -->
  <form on:submit={handleSubmit} class="flex justify-center gap-4 items-center">
    <input
      type="text"
      placeholder="Enter your Bluesky handle"
      bind:value={handle}
      class="w-3/4 md:w-1/2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
    />
    <button 
      type="submit" 
      class="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition">
      Analyze
    </button>
  </form>
</div>
