<script>
  let title = "Title";
  function handleClick() {
    console.log("click");
  }
</script>

<style>
  .window {
    z-index: 5;
    margin: 1rem;
    max-width: 20rem;
    background: var(--alt);
    border-style: solid;
    border: 2px solid var(--primary);
    box-shadow: 2px 2px 0 0 var(--primary);
  }
  .window-header {
    display: flex;
    flex-direction: row;
    padding: 0.375rem 0.25rem;
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
    margin: 0 0.5rem 0 0.25rem;
    background: var(--alt);
    box-shadow: 0.25rem 0 0 0.25rem var(--alt), -0.25rem 0 0 0.25rem var(--alt);
    font-size: 0;
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

<div class="window">
  <header class="window-header">
    <button
      type="button"
      class="window-close"
      on:click={handleClick}>close</button>
    <div class="window-title">
      <h2>{title}</h2>
    </div>
  </header>
  <section class="window-main">
    <h1>Pezillionaire Interactive Manufacturing</h1>
  </section>
</div>
