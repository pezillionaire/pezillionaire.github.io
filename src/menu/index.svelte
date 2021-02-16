<script>
  import { menus, menusActive } from "../stores.js";
  import Item from "./MenuAction.svelte";
  import Link from "./MenuLink.svelte";

  // - index value of the menu from store
  // - passed via prop from Nav generator
  export let menuIndex;
  $: menuIndex;

  const menu = $menus[menuIndex];
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
</script>

<menu on:click={menuToggle} on:mouseenter={menuCheckActive} on>
  <button class:expanded>
    {#if menu.svg}
      <span class="menu-svgicon">
        {@html menu.svg}
      </span>
    {/if}
    {#if menu.name}
      <span class={`menu-name ${menu.svg ? "hidden" : ""}`}>{menu.name}</span>
    {/if}
  </button>

  {#if expanded}
    <ul>
      {#each menu.items as item, index}
        <li :class={item.type}>
          {#if item.type === "folder"}
            <svelte:self {...item} />
          {:else if item.type === "link"}
            <Link {...item} />
          {:else}
            <Item {item} {index} on:action />
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</menu>

<style>
  menu {
    stroke: var(--primary);
  }
  .menu-svgicon {
    height: 100%;
    border: none;
    display: flex;
    align-items: flex-end;
  }
  .menu-svgicon :global(svg) {
    height: 2rem;
    width: 2rem;
  }

  .menu-name.hidden {
    font-size: 0;
  }

  .expanded {
    background-color: var(--primary);
    color: var(--alt);
    stroke: var(--alt);
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
</style>
