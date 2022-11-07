<script lang="ts">
  import { onMount } from 'svelte';
  import { windows } from './store';
  import Window from './windows/Windows.svelte';

  let test;
  onMount(() => test.focus());
  const closeWindow = (index: number) => {
    $windows[index].visible = false;
  };
</script>

{#each $windows as window, index}
  {#if window.visible}
    <Window {window} {index} on:close={() => closeWindow(index)} bind:this={test} />
  {/if}
{/each}
