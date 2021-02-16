<script>
  import { menus, menusActive } from "../stores.js";
  import Item from "./MenuAction.svelte";
  import Link from "./MenuLink.svelte";

  export let menuIndex;
  $: menuIndex;

  const rootmenu = $menus[menuIndex];
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
  const checkActive = () => {
    if ($menusActive & !expanded) {
      menuToggle();
    }
  };
</script>

<div class="folder" on:click={menuToggle} on:mouseenter={checkActive} on>
  <button class:expanded>
    {#if rootmenu.svg}
      <span class="folder-svgicon">
        {@html rootmenu.svg}
      </span>
    {/if}
    {#if rootmenu.name}
      <span class={`folder-name ${rootmenu.svg ? "hidden" : ""}`}
        >{rootmenu.name}</span
      >
    {/if}
  </button>

  {#if expanded}
    <ul>
      {#each rootmenu.items as item, index}
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
</div>

<style>
  .folder {
    display: flex;
    stroke: var(--primary);
  }
  .folder-svgicon {
    height: 100%;
    border: none;
    display: flex;
    align-items: flex-end;
  }
  .folder-svgicon :global(svg) {
    height: 2rem;
    width: 2rem;
  }

  .folder-name.hidden {
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
