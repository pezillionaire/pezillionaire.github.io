<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MenuItem } from '../../types';

  const dispatch = createEventDispatcher();

  // export let active;
  // export let name;
  export let index: number;
  export let item: MenuItem;

  // $: active;
  // $: name;
  $: index;
  $: item;

  let isActive = item.active;

  function toggle(item: MenuItem) {
    console.log(item);
    isActive = !isActive;
    item.active = !item.active;
    const value = {
      item,
      index,
    };
    dispatch('action', value);
  }
</script>

<button type="button" on:click={() => toggle(item)}>
  <span>{item.name}</span>
  <span class="menuitem icon">{isActive ? '✓' : ''}</span>
</button>
