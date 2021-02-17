<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // export let active;
  // export let name;
  export let index;
  export let item;

  // $: active;
  // $: name;
  $: index;
  $: item;

  let isActive = item.active;

  function toggle(item) {
    isActive = !isActive;
    item.active = !item.active;
    const value = {
      item,
      index,
    };
    dispatch('action', value);
  }
</script>

<button type="button" on:click={toggle(item)}>
  <span>{item.name}</span>
  <span class="menuitem-icon">{isActive ? '✓' : ''}</span>
</button>

<style>
  button {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    text-transform: capitalize;
    white-space: pre;
    line-height: 1.25;
  }
  button span {
    display: inline;
  }
  .menuitem-icon {
    min-width: 1rem;
    margin-left: 2rem;
  }
</style>
