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

<script>
  import { createEventDispatcher, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');
  //test
  let modal;

  let window = {
    top: 32,
    left: 32,
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

    if (e.key === 'Tab') {
      // trap focus
      const nodes = modal.querySelectorAll('*');
      const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };

  const previously_focused =
    typeof document !== 'undefined' && document.activeElement;

  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus();
    });
  }
  export let title = 'title';
</script>

<style>
  .window {
    position: absolute;
    user-select: none;
    z-index: 5;
    max-width: 20rem;
    background: var(--alt);
    border-style: solid;
    border: 2px solid var(--primary);
    box-shadow: 2px 2px 0 0 var(--primary);
  }

  .window-header {
    display: flex;
    flex-direction: row;
    padding: 0.375rem;
    width: 100%;
    border-bottom: 2px solid var(--primary);
    background-color: var(--alt);
    background-image: linear-gradient(
      var(--primary) 0.125rem,
      transparent 0.125rem
    );
    background-size: 100% 0.375rem;
    background-position: 0 1.25rem;
    background-clip: content-box;
  }
  .window-close {
    flex: 0 0 auto;
    border-radius: 0;
    border: 2px solid var(--primary);
    height: 1.5rem;
    width: 1.5rem;
    line-height: 0;
    margin: 0 0.375rem 0 0rem;
    background: var(--alt);
    box-shadow: 0.125rem 0 0 0.25rem var(--alt),
      -0.125rem 0 0 0.25rem var(--alt);
    font-size: 0;
  }

  .window-close:hover,
  .window-close:focus {
    background: linear-gradient(
        45deg,
        transparent 0%,
        transparent 45%,
        var(--primary) 45%,
        var(--primary) 55%,
        transparent 55%,
        transparent 100%
      ),
      linear-gradient(
        135deg,
        var(--alt) 0%,
        var(--alt) 45%,
        var(--primary) 45%,
        var(--primary) 55%,
        var(--alt) 55%,
        var(--alt) 100%
      );
  }

  .window-title {
    flex: 1 1 100%;
    display: flex;
    padding-right: 2rem;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .window-title h2 {
    flex: 0 1 auto;
    background: var(--alt);
    padding: 0 0.75rem;
    font-size: 1.25rem;
  }
  .window-main {
    padding: 1rem;
  }
</style>
