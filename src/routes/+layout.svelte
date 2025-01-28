<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import About from "$lib/components/modals/About.svelte";
  import ChangeLog from "$lib/components/modals/ChangeLog.svelte";
  import Login from "$lib/components/modals/Login.svelte";
  import "../app.css";
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, FooterIcon, Tooltip } from 'flowbite-svelte';

  export let data: {session: App.IronSessionBsky | null};

  export let loginModal = false;
  export let aboutModal = false;
  export let changeLogModal = false;

  const handleLogout = async () => {
    const res = await fetch('/logout', { method: 'POST' });  // ログアウト処理のAPIを呼び出し
    if (res.ok) {
      // ログアウトが成功した場合の処理（必要に応じてリダイレクトや状態管理）
      // isLoggedOut = true;
      // window.location.href = '/';  // ログアウト後のリダイレクト先
    } else {
      console.error('Logout failed');
    }
  };
</script>

<div class="flex flex-col min-h-screen">
  <Navbar class="text-gray-100 bg-primary-900 z-20">
    <NavBrand href="/">
      <span class="font-orbitron text-2xl ml-2 text-gray-100">Blu-lyzer</span>
    </NavBrand>
    <NavHamburger />
    <NavUl>
      {#if data.session}
        <NavLi class="md:text-gray-100 sm:text-primary-900" on:click={() => handleLogout()}>Logout</NavLi>
      {:else}
        <NavLi class="md:text-gray-100 sm:text-primary-900" on:click={() => loginModal = true}>Login</NavLi>
      {/if}
      <NavLi class="md:text-gray-100 sm:text-primary-900" on:click={() => aboutModal = true}>About</NavLi>
      <NavLi class="md:text-gray-100 sm:text-primary-900" on:click={() => changeLogModal = true}>ChangeLog</NavLi>
    </NavUl>
  </Navbar>
  
  <main class="container flex-1 mx-auto">
    <slot />
  </main>
  
  <Footer />  
</div>

<Login bind:loginModal />
<About bind:aboutModal />
<ChangeLog bind:changeLogModal />
