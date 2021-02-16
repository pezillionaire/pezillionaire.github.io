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
  <div class="click-capture" on:click|once={menusClose} />
{/if}

<style>
  .click-capture {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0);
  }
</style>
