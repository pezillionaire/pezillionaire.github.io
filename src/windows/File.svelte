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
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function action(value: string): CustomEvent {
    dispatch('action', value)
  }

  export let active: boolean
  export let name: string
  export let type

  $: active
  $: type
  $: name
</script>

<button type="button" on:click={action(name)}>
  <span>{name}</span>
  <span class="menuitem-icon">{active ? '✓' : ''}</span>
</button>
