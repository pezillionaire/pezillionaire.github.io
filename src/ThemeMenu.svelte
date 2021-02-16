<script>
  import { menus, menusActive } from './stores.js';
  import { onMount } from 'svelte';

  // - index value of the menu from store
  // - passed via prop from Nav generator
  export let menuIndex;
  $: menuIndex;

  const menu = $menus[menuIndex];
  const items = $menus[menuIndex].items;
  let expanded = false;

  // - keep an eye on the menu activity
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

  // - change active menu selection
  const itemSelect = (index) => {
    items[index].active = true;
    // ideally the selection action would be passed into the
    setTheme(index);
    setTimeout(() => {
      menuToggle(false);
    }, 200);
  };

  //
  // -- Theme Selection wizardry
  //

  const setTheme = (index) => {
    // clear out active menu item
    items.forEach((i) => {
      i.active = false;
    });
    // not really theming but I still wanna set the menu selection JIC (onload)
    items[index].active = true;
    localStorage.clear();
    localStorage.setItem('theme', JSON.stringify(items[index]));
    const root = document.querySelector(':root');
    root.style.setProperty('--primary', items[index].primary);
    root.style.setProperty('--alt', items[index].alt);
  };

  // -- check local for a set theme or set the first one
  const getTheme = () => {
    if (localStorage.getItem('theme') == '') {
      // set to default
      return 0;
    } else {
      const theme = JSON.parse(localStorage.getItem('theme'));
      const themeByName = (i) => i.name === theme.name;
      setTheme(items.findIndex(themeByName));
    }
  };

  // - set the theme on load
  onMount(async () => {
    getTheme();
  });
</script>

<!-- ------- HTML template ------- -->

<menu>
  <button
    type="button"
    class:active={expanded}
    on:click={menuToggle}
    on:mouseenter={menuCheckActive}>{menu.name}</button
  >
  {#if expanded}
    <ul role="menu">
      {#each items as { name, active }, item}
        <li>
          <button type="button" on:click|once={() => itemSelect(item)}>
            <span>{name}</span>
            <span class="menuitem-icon">{active ? '✓' : ''}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</menu>

<!-- ------- Style ------- -->
<style>
  menu ul {
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
  menu ul li {
    width: 100%;
  }
  menu ul button,
  menu ul a {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    text-transform: capitalize;
    white-space: pre;
    line-height: 1.25;
  }
  .menuitem-icon {
    min-width: 1rem;
    margin-left: 2rem;
  }
</style>
