<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  // import { windows } from './store.js';
  import PezHD from './windows/pezHD.svelte';
  import Garbage from './windows/Gabage.svelte'
  // - index value of the window from store
  // - passed via prop from App
  export let window = {};
  export let index = 0;

  $: window;
  $: index

  const components = {};
  components['Pez HD'] = PezHD;
  components['Garbage'] = Garbage;

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  const app = document.getElementById('app');

  function start() {
    window.moving = true;
    // remove text selection when dragging windows
    app.style.userSelect = 'none';
  }
  function stop() {
    window.moving = false;
    // reset default text select on release
    app.removeAttribute('style');
    if (window.left <= 0) {
      window.left = 0;
    }
    if (window.top <= 0) {
      window.top = 0;
    }
  }

  function move(e) {
    if (window.moving) {
      window.left += e.movementX;
      window.top += e.movementY;

    }
  }

  const handle_keydown = (e) => {
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
      previously_focused.focus();
    });
  }
  onMount(async () => {
    // getTheme();
    window.left = 16;
    window.top = 16;
  });
  // export let title = 'title';
</script>

<div class="window" style="left:{window.left}px; top:{window.top}px;" >
  <header class="window-header" on:mousedown={start}>
    <button type="button" class="window-close" on:click={close}>close window</button>
    <div class="window-title">
      <h2>{window.title}</h2>
    </div>
  </header>
  <section class="window-main">
    <svelte:component this={components[window.title]}/>
  </section>
</div>

<svelte:window
  on:keydown={handle_keydown}
  on:mouseup={stop}
  on:mousemove={move}
/>

<style>
</style>
