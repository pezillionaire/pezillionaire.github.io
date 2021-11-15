<script>
  import { windows } from './store.js';
  import Window from './windows/Windows.svelte';

  const closeWindow = (index) => {
    $windows[index].visible = false;
  }
</script>


{#each $windows as window, index}
  {#if window.visible}
    <Window window={window} index={index} on:close={() => (closeWindow(index))} />
  {/if}
{/each}
