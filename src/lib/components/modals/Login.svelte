<script lang="ts">
  import { Modal } from "flowbite-svelte";
  import Spinner from "../Spinner.svelte";
  import ErrorAlert from "../ErrorAlert.svelte";
  import { t } from "$lib/translations/translations"

  export let loginModal: boolean;
  let handle = "";
  let isFetching = false;
  let isLoginError = false;

  async function submitLogin() {
    isFetching = true;
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
    } catch (err) {
      isLoginError = true;
      console.error("Login error:", err);
    }
  }
</script>

<Modal title="Log in" bind:open={loginModal} autoclose outsideclose class="z-10">
  <form on:submit|preventDefault={submitLogin} class="space-y-4">
    <div class="mb-4">
      <label for="handle" class="block text-sm font-medium text-gray-700 mb-2">
        Input Your Handle
      </label>
      <input
        id="handle"
        type="text"
        bind:value={handle}
        placeholder="handle.bsky.social"
        class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-primary-300 mb-4"
        required
      />
      <p class="font-medium mb-1">{$t("top.login_0")}</p>
      <p>{$t("top.login_1")}</p>
      <p>{$t("top.login_2")}</p>
      <img src="/active_heatmap.png" alt="active heatmap sample" class="mt-4" />
    </div>
    <div class="flex justify-end">
      <button on:click={submitLogin} type="submit" class="bg-primary-900 text-white px-4 py-2 rounded-lg">
        Log In
      </button>
    </div>
  </form>
</Modal>

{#if isFetching}
  <Spinner />  
{/if}

<ErrorAlert flag={isLoginError} errorMessage="Login failed" />
