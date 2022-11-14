<script lang="ts">
  import { windows } from '../store';
  import Window from '../components/Window.svelte';

  const closeWindow = (index: number) => {
    $windows[index].visible = false;
  };
</script>

{#each $windows as window, index}
  {#if window.visible}
    <Window {window} {index} on:close={() => closeWindow(index)} />
  {/if}
{/each}
