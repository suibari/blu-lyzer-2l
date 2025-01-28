<script lang="ts">
  import { Modal } from "flowbite-svelte";

  export let loginModal: boolean;
  let handle = "";

  async function submitLogin() {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      if (!response.ok) {
        throw new Error("Failed to log in");
      }

      const authUrl = await response.json();
      console.log('Login successful:', authUrl);
      window.location.href = authUrl;
      loginModal = false; // ログイン成功時にモーダルを閉じる
    } catch (err) {
      console.error("Login error:", err);
    }
  }
</script>

<Modal title="Log in" bind:open={loginModal} autoclose outsideclose>
  <form on:submit|preventDefault={submitLogin} class="space-y-4">
    <div class="mb-4">
      <label for="handle" class="block text-sm font-medium text-gray-700 mb-1">
        Handle
      </label>
      <input
        id="handle"
        type="text"
        bind:value={handle}
        placeholder="your-handle.bsky.social"
        class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-primary-300"
        required
      />
    </div>
    <div class="flex justify-end">
      <button on:click={submitLogin} type="submit" class="bg-primary-900 text-white px-4 py-2 rounded-lg">
        Log In
      </button>
    </div>
  </form>
</Modal>
