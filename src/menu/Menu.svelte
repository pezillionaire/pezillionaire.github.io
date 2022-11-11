<script lang="ts">
  import { menus, menusActive } from '../store';
  import type { MenuItem, MenuItemLink } from '../types';
    import ItemAction from './ItemAction.svelte';
  import Action from './ItemAction.svelte';
    import ItemLink from './ItemLink.svelte';
  import Link from './ItemLink.svelte';

  // - index value of the menu from store
  // - passed via prop from Nav generator
  export let menuIndex: number;
  export let menuItems: MenuItem[] | MenuItemLink[];
  $: menuIndex;
  $: menuItems

  const menu = $menus[menuIndex];
  let expanded = false;

  // - keep an eye on the menu activity
  // - menuIndex seems to break recursion (should rely on index maybe?)
  menus.subscribe(value => {
    expanded = value[menuIndex].active;
  });

  // - toggle menu open/closed
  // - if value is set to boolean use that - otherwise filp the value
  const menuToggle = (value?: boolean) => {
    value === false || value === true ? (expanded = value) : (expanded = !expanded);
    $menus[menuIndex].active = expanded;
    $menusActive = expanded;
    $menus.forEach((m, i) => {
      if (i !== menuIndex) {
        m.active = false;
      }
    });
    $menus = $menus;
  };

  // - when mouseing on, check to see if this is active/expanded
  const menuCheckActive = () => {

    if ($menusActive && !expanded) {
      menuToggle();
    }
  };
</script>

<menu>
  <button
    id={$menus[menuIndex].name}
    class:active={expanded}
    on:click={() => {
      menuToggle();
    }}
    on:mouseenter={menuCheckActive}
  >
    {#if menu.svg}
      <span class="menu-svgicon">
        {@html menu.svg}
      </span>
    {/if}
    {#if menu.name}
      <span class={`menu-name ${menu.svg ? 'hidden' : ''}`}>{menu.name}</span>
    {/if}
  </button>

  {#if expanded}
    <ul>
      {#each menuItems as item, index}
        <li class={item.type}>
          <!-- {#if item.type === 'folder'}
            <svelte:self {...item} /> -->
          <!-- svelte-ignore missing-declaration -->
          {#if typeof MenuItemLink}
            <Link {...item} />
          {:else if item.type === 'action'}
            <Action {item} {index} on:action />
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</menu>
