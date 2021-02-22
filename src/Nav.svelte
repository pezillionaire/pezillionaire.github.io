<script>
  import { menus, menusActive } from './stores.js';
  import Menu from './menu/Menu.svelte';
  import SelectMenu from './menu/SelectMenu.svelte';

  const comps = {
    SelectMenu,
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

<nav role="navigation">
  {#each $menus as menu, index}
    <svelte:component this={comps[menu.component]} menuIndex={index}/>
  {/each}
</nav>
{#if $menusActive}
  <div class="click-capture" on:click|once={menusClose} />
{/if}
