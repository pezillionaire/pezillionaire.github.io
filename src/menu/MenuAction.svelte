<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let active;
  export let name;
  export let type;

  $: active;
  $: type;
  $: name;

  function toggle() {
    active = !active;
    const value = {
      name,
      active,
      type,
    };
    dispatch('action', value);
  }
</script>

<button type="button" on:click={toggle(name)}>
  <span>{name}</span>
  <span class="menuitem-icon">{active ? '✓' : ''}</span>
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
