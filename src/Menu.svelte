<script lang="ts">
  import { menus, menusActive } from './store';
  import Clock from './menu/Clock.svelte';
  import Menu from './menu/Menu.svelte';
  import SelectMenu from './menu/SelectMenu.svelte';
  import { SvelteComponent } from 'svelte';

  const comps: { [key: string]: typeof SvelteComponent } = {
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

<nav>
  {#each $menus as menu, index}
    <svelte:component this={comps[menu.component]} menuIndex={index}/>
  {/each}
</nav>
<Clock />

{#if $menusActive}
  <div class="click-capture" on:click|once={menusClose} />
{/if}
