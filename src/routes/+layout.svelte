<script>
  import Footer from "$lib/components/Footer.svelte";
  import "../app.css";
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, FooterIcon } from 'flowbite-svelte';
</script>

<div class="flex flex-col min-h-screen">
  <Navbar class="text-gray-100 bg-primary-900">
    <NavBrand href="/">
      <span class="font-orbitron text-2xl ml-2">Blu-lyzer</span>
    </NavBrand>
    <NavHamburger />
    <NavUl>
      <NavLi class="md:text-gray-100 sm:text-primary-900">About</NavLi>
      <NavLi class="md:text-gray-100 sm:text-primary-900">Disclaimer</NavLi>
      <NavLi class="md:text-gray-100 sm:text-primary-900">ChangeLog</NavLi>
    </NavUl>
  </Navbar>
  
  <main class="container flex-1 mx-auto">
    <slot />
  </main>
  
  <Footer />  
</div>
