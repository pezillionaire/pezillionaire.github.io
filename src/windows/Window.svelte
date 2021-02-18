<script>
  import { createEventDispatcher, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');
  let modal;

  let window = {
    top: 16,
    left: 16,
    moving: false,
  };

  function start() {
    window.moving = true;
  }
  function stop() {
    window.moving = false;
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
  export let title = 'title';
</script>

<div
  class="window"
  style="left:{window.left}px; top:{window.top}px;"
  bind:this={modal}
>
  <header class="window-header" on:mousedown={start}>
    <button type="button" class="window-close" on:click={close}
      >close modal</button
    >
    <div class="window-title">
      <h2>{title}</h2>
    </div>
  </header>
  <section class="window-main">
    <slot />
  </section>
</div>

<svelte:window
  on:keydown={handle_keydown}
  on:mouseup={stop}
  on:mousemove={move}
/>

<style>
</style>
