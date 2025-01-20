<script lang="ts">
  export let title: string;
  export let content: string | number | HTMLElement;
</script>

<div class="border rounded-lg p-4 bg-white shadow-md">
  <h3 class="text-lg font-bold text-gray-800">{title}</h3>
  <div class="text-xl text-gray-600 mt-2">{content}</div>
</div>
