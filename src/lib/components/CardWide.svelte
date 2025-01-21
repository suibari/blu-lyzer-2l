<script lang="ts">
  export let title: string; // カードのタイトル
  export let items: Array<{ label: string; value: string | number }>; // 表示する項目のリスト
</script>

<div class="p-4 bg-white shadow rounded-lg">
  <h3 class="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
  <div class="flex gap-4 overflow-x-auto">
    {#each items as item}
      <div class="flex flex-col items-start bg-gray-100 p-4 rounded-lg shadow-sm min-w-[150px]">
        <p class="text-sm font-semibold text-gray-700">
          <span class="text-gray-500">{item.label}:</span> {item.value}
        </p>
      </div>
    {/each}
  </div>
</div>
