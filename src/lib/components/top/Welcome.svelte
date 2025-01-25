<script lang="ts">
  import { changelog } from './modals/config/changelog';
  import Autocomplete from './top/Autocomplete.svelte';
</script>

<div class="container flex flex-col justify-center items-center h-full fixed inset-0 text-center text-primary-800">
  <!-- タイトル部分 -->
  <div class="title font-orbitron text-6xl mb-4">Blu-lyzer</div>

  <!-- バージョン情報 -->
  <div class="font-orbitron text-xl mb-4">{changelog[0].version}</div>

  <!-- 説明部分 -->
  <div class="description text-md md:text-lg w-3/4 md:w-full mx-auto mb-6">
    <p>Blu-lyzer is a Bluesky post analysis tool.</p>
    <p>No login or installation required.</p>
    <p>Enter your Bluesky handle (without "@")!</p>
  </div>

  <!-- 入力フォーム部分 -->
  <div class="relative w-3/4 max-w-lg">
    <Autocomplete />
  </div>
</div>
