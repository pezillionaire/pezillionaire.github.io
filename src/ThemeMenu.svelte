<script>
  import { menus, menusActive } from './stores.js';
  import { onMount } from 'svelte';

  // - index value of the menu from menu store
  export let menuIndex;
  $: menuIndex;

  const menu = $menus[menuIndex];
  const items = $menus[menuIndex].items;

  let activeTheme = 0;
  let expanded = false;

  // - keep an eye on the menu activity
  menus.subscribe((value) => {
    expanded = value[menuIndex].active;
  });

  // - toggle menu opne/closed
  const menuToggle = () => {
    expanded = !expanded;
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
  const checkActiveMenu = () => {
    if ($menusActive & !expanded) {
      menuToggle();
    }
  };

  // - change active menu selection
  const menuSelect = (index) => {
    setTheme(index);
    setTimeout(() => {
      menuToggle();
    }, 200);
  };

  // -- Theme Selection wizardry

  const setTheme = (index) => {
    const root = document.querySelector(':root');
    items[activeTheme].active = false;
    items[index].active = true;
    activeTheme = index;
    localStorage.clear();
    localStorage.setItem('theme', JSON.stringify(items[index]));
    root.style.setProperty('--primary', items[index].primary);
    root.style.setProperty('--alt', items[index].alt);
  };

  // -- check local for a set theme or set the first one
  const getTheme = () => {
    if (localStorage.getItem('theme') == '') {
      return items[0];
    } else {
      const theme = localStorage.getItem('theme');
      return JSON.parse(theme);
    }
  };

  // - set the theme on load
  onMount(async () => {
    const theme = await getTheme();
    const themeByName = (i) => i.name === theme.name;
    setTheme(items.findIndex(themeByName));
  });
</script>

<!-- ------- HTML template ------- -->

<span class="dropdown" id="theme">
  <button
    type="button"
    class:active={expanded}
    on:click={menuToggle}
    on:mouseenter={checkActiveMenu}>{menu.name}</button
  >
  {#if expanded}
    <ul role="menu">
      {#each items as { name, active }, item}
        <li>
          <button type="button" on:click|once={() => menuSelect(item)}>
            <span>{name}</span>
            <span class="menuitem-icon">{active ? '✓' : ''}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</span>

<!-- ------- Style ------- -->
<style>
  .dropdown {
    display: flex;
  }
  ul {
    z-index: 101;
    list-style: none;
    position: absolute;
    top: 2.375rem;
    background-color: var(--alt);
    border: 2px solid var(--primary);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    box-shadow: 1px 1px 0 0 var(--primary);
  }
  ul li {
    width: 100%;
  }
  ul li.border {
    border-bottom: 1px solid var(--primary);
  }
  ul button,
  ul a {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    text-transform: capitalize;
    white-space: pre;
    line-height: 1.25;
  }
  ul button span,
  ul a span {
    display: inline;
  }
  .menuitem-icon {
    min-width: 1rem;
    margin-left: 2rem;
  }

  .bg {
    z-index: 100;
    content: '';
    position: fixed;
    top: 2.5rem;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
  }
</style>
