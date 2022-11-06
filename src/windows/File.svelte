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

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  // import { mount_component } from 'svelte/internal';

  const dispatch = createEventDispatcher();

  const action = (value: string) => {
    console.log('action', value);
    dispatch('action', value);
  };
  const handler = (value: string) => {
    console.log('action', value);
  };

  const close = (e: Event) => {
    console.log(e);
    // dispatch('close');
  };

  export let active: boolean;
  export let name: string;
  export let type: 'action' | 'link' | 'select' | 'folder';

  $: active;
  $: type;
  $: name;
</script>

<button type="button" on:click={close}>
  <span>{name} test</span>
  <span class="menuitem-icon">{active ? '✓' : ''}</span>
</button>
