<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
    import About from "$lib/components/modals/About.svelte";
    import ChangeLog from "$lib/components/modals/ChangeLog.svelte";
  import "../app.css";
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, FooterIcon } from 'flowbite-svelte';

  let aboutModal = false;
  let disclaimerModal = false;
  let changeLogModal = false;
</script>

<div class="flex flex-col min-h-screen">
  <Navbar class="text-gray-100 bg-primary-900 z-20">
    <NavBrand href="/">
      <span class="font-orbitron text-2xl ml-2">Blu-lyzer</span>
    </NavBrand>
    <NavHamburger />
    <NavUl>
      <NavLi class="md:text-gray-100 sm:text-primary-900" on:click={() => aboutModal = true}>About</NavLi>
      <NavLi class="md:text-gray-100 sm:text-primary-900" on:click={() => changeLogModal = true}>ChangeLog</NavLi>
    </NavUl>
  </Navbar>
  
  <main class="container flex-1 mx-auto">
    <slot />
  </main>
  
  <Footer />  
</div>

<About bind:aboutModal />
<ChangeLog bind:changeLogModal />
