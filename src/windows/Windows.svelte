<style>
</style>

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, SvelteComponent } from 'svelte';
  // import type { Window } from '../store';
  import PezHD from './pezHD.svelte';
  import Garbage from './Gabage.svelte';

  type Window = {
    title: string;
    top: number;
    left: number;
    width: number;
    height: number;
    visible: boolean;
    moving: boolean;
  };

  // - index value of the window from store
  // - passed via prop from App
  export let window: Window;
  export let index = 0;

  $: window;
  $: index;

  const components: { [key: string]: typeof SvelteComponent } = {};
  components['Pez HD'] = PezHD;
  components['Garbage'] = Garbage;

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  const windows = document.getElementById('windows');

  function start() {
    window.moving = true;
    // remove text selection when dragging windows
    if (windows) {
      windows.style.userSelect = 'none';
    }
  }
  function stop() {
    window.moving = false;
    // reset default text select on release
    if (windows) {
      windows.removeAttribute('style');
    }
    if (window.left <= 0) {
      window.left = 4;
    }
    if (window.top <= 0) {
      window.top = 4;
    }
  }

  function move(e: { movementX: number; movementY: number }) {
    if (window.moving) {
      window.left += e.movementX;
      window.top += e.movementY;
    }
  }

  const handle_keydown = (e: { key: string }) => {
    if (e.key === 'Escape') {
      close();
      return;
    }

    // if (e.key === 'Tab') {
    //   // trap focus
    //   const nodes = modal.querySelectorAll('*');
    //   const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

    //   let index = tabbable.indexOf(document.activeElement);
    //   if (index === -1 && e.shiftKey) index = 0;

    //   index += tabbable.length + (e.shiftKey ? -1 : 1);
    //   index %= tabbable.length;

    //   tabbable[index].focus();
    //   e.preventDefault();
    // }
  };

  const previously_focused = typeof document !== 'undefined' && document.activeElement;

  if (previously_focused) {
    onDestroy(() => {
      (previously_focused as HTMLElement).focus();
    });
  }
  onMount(async () => {
    window.left = 16;
    window.top = 16;
  });
</script>

<div class="window" style="left:{window.left}px; top:{window.top}px;">
  <header class="window-header" on:mousedown={start}>
    <button type="button" class="window-close" on:click={close}>close window</button>
    <div class="window-title">
      <h2>{window.title}</h2>
    </div>
  </header>
  <section class="window-main">
    <svelte:component this={components[window.title]} />
  </section>
</div>

<svelte:window on:keydown={handle_keydown} on:mouseup={stop} on:mousemove={move} />
