<script>
  import File from './File.svelte';
  import Link from './Link.svelte';

  export let expanded = false;
  export let root;

  $: root;

  function toggle() {
    expanded = !expanded;
  }
</script>

<div
  class={`folder type-${root.type.toLowerCase()}`}
  on:mouseenter={toggle}
  on:mouseleave={toggle}
  on:click={toggle}
>
  <button class:expanded>
    {#if root.svg}
      <span class="folder-svgicon">
        {@html root.svg}
      </span>
      <span class="folder-svg-label">{root.type}</span>
    {/if}
    {#if root.name}
      <span class="folder-name">{root.name}</span>
    {/if}
  </button>

  {#if expanded}
    <ul>
      {#each root.files as file}
        <li :class={file.type}>
          {#if file.type === 'folder'}
            <svelte:self {...file} />
          {:else}
            <File {...file} />
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

  .folder-svg-label {
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
