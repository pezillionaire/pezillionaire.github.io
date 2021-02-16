<script>
  import { menus, menusActive } from "./stores.js";
  import Menu from "./menu/index.svelte";
  import ThemeMenu from "./ThemeMenu.svelte";

  const comps = {
    ThemeMenu,
    Menu,
  };

  const menusClose = () => {
    $menusActive = false;
    $menus.forEach((m) => {
      m.active = false;
    });
    $menus = $menus;
  };
</script>

<nav class="navMenu">
  {#each $menus as menu, index}
    <svelte:component this={comps[menu.component]} menuIndex={index} />
  {/each}
</nav>
{#if $menusActive}
  <div class="bg" on:click|once={menusClose} />
{/if}

<style>
  .bg {
    z-index: 100;
    content: "";
    position: fixed;
    top: 2.5rem;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0);
  }
</style>
