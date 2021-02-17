<script>
  import { menus, menusActive } from '../stores.js';
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


  // --------------------------------------------------
  // -- Theme Selection wizardry
  // --------------------------------------------------

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

  // --------------------------------------------------
  // -- Menu functionality
  // --------------------------------------------------

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
    // ideally the actions would be passed in
    setTheme(index);
    // TODO: replace w/ CSS transitions
    setTimeout(() => {
      menuToggle(false);
    }, 200);
  };

  // - set the theme on load
  onMount(async () => {
    getTheme();
  });
</script>

<!-- ------- HTML template ------- -->

<menu>
  <button type="button" class:active={expanded} on:click={menuToggle} on:mouseenter={menuCheckActive}>
    {menu.name}
  </button>
  {#if expanded}
    <ul role="menu">
      {#each items as { name, active }, index}
        <li>
          <button type="button" on:click|once={() => itemSelect(index)}>
            <span>{name}</span>
            <span class="menuitem-icon">{active ? '✓' : ''}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</menu>
