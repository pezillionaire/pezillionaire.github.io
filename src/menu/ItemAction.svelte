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
  <span class="menuitem icon">{isActive ? '✓' : ''}</span>
</button>
