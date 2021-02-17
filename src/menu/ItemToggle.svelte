<script>
  import { menus } from './stores.js';


  // <Item {..item} {index} >

  // - index value of the menu from store
  // - passed via prop from Nav generator
  export let menuIndex;
  export let item;
  $: menuIndex;
  $: item;

  const items = $menus[menuIndex].items;

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
  // const getTheme = () => {
  //   if (localStorage.getItem('theme') == '') {
  //     // set to default
  //     return 0;
  //   } else {
  //     const theme = JSON.parse(localStorage.getItem('theme'));
  //     const themeByName = (i) => i.name === theme.name;
  //     // setTheme(items.findIndex(themeByName));
  //   }
  // };

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


</script>

<button type="button" on:click|once={() => itemSelect(item)}>
  <span>{name}</span>
  <span class="menuitem-icon">{active ? '✓' : ''}</span>
</button>

<style>
</style>
