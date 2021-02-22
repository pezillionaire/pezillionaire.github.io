<script>
  import { menus, menusActive } from '../stores.js';
  import Action from './ItemAction.svelte';
  import Link from './ItemLink.svelte';

  // - index value of the menu from store
  // - passed via prop from Nav generator
  export let menuIndex;
  $: menuIndex;

  const menu = $menus[menuIndex];
  let expanded = false;

  // - keep an eye on the menu activity
  // - menuIndex seems to break recursion (should rely on index maybe?)
  menus.subscribe((value) => {
    expanded = value[menuIndex].active;
  });

  // - toggle menu open/closed
  // - if value is set to boolean use that - otherwise filp the value
  const menuToggle = (value) => {
    value === false || value === true
      ? (expanded = value)
      : (expanded = !expanded);
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
    if ($menusActive & !expanded) {
      menuToggle();
    }
  };
</script>

<menu>
  <button class:active={expanded} on:click={menuToggle} on:mouseenter={menuCheckActive}>
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
      {#each menu.items as item, index}
        <li :class={item.type}>
          {#if item.type === 'folder'}
            <svelte:self {...item} />
          {:else if item.type === 'link'}
            <Link {...item} />
          {:else}
            <Action {item} {index} on:action />
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</menu>
