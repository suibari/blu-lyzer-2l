<script lang="ts">
  import pkg from 'lodash';
  const {debounce} = pkg;
  import { goto } from '$app/navigation';
    import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

  let query = '';
  let suggestions: ProfileView[] = [];
  let isLoading = false;
  let selectedIndex = -1; // 矢印キーで選択されたサジェストのインデックス

  const fetchSuggestions = debounce(async (q: string) => {
    if (!q.trim()) { 
      suggestions = [];
      selectedIndex = -1;
      return;
    }

    isLoading = true; // ローディング開始
    try {
      const res = await fetch(`/api/searchActorsTypeahead?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        console.error('Failed to fetch suggestions:', res.status);
        suggestions = [];
        return;
      }

      const data = await res.json();
      suggestions = data;
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      suggestions = [];
    } finally {
      isLoading = false; // ローディング終了
    }
  }, 300);

  // エンターキーで遷移する関数
  const selectSuggestion = (index: number) => {
    if (index >= 0 && index < suggestions.length) {
      const selectedUser = suggestions[index].handle;
      goto(`/stats/${selectedUser}`); // `/stats/[user]` に遷移
    }
  };

  // キーボード操作の処理
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!suggestions.length) return;

    if (event.key === 'ArrowDown') {
      selectedIndex = (selectedIndex + 1) % suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
      selectSuggestion(selectedIndex);
      event.preventDefault();
    }
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="max-w-md mx-auto relative"
  on:keydown={handleKeyDown}
>
  <input
    type="text"
    bind:value={query}
    on:input={() => {
      fetchSuggestions(query);
      selectedIndex = -1;
    }}
    placeholder="Type a Bluesky handle..."
    class="w-full p-3 border border-gray-300 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {#if query}
  <ul
    class="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded shadow z-10 max-h-40 overflow-auto"
  >
    {#if isLoading}
      <li class="p-2 text-gray-500">Loading...</li>
    {:else if suggestions.length > 0}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      {#each suggestions as suggestion, i}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          class="p-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer {selectedIndex === i ? 'bg-blue-100' : ''}"
          on:click={() => selectSuggestion(i)}
        >
          <img
            src={suggestion.avatar}
            alt="{suggestion.handle}'s avatar"
            class="w-8 h-8 rounded-full"
          />
          <span>{suggestion.handle}</span>
        </li>
      {/each}
    {:else}
      <li class="p-2 text-gray-500">No suggestions found</li>
    {/if}
  </ul>
  {/if}
</div>
