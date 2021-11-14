<script>
  import { menus, menusActive } from './store.js';
  import Clock from './Clock.svelte';
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
<Clock />

{#if $menusActive}
  <div class="click-capture" on:click|once={menusClose} />
{/if}
