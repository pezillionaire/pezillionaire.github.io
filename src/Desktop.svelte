<script>
  import Window from "./Window.svelte";
</script>

<style>
  .desktop {
    background-image: linear-gradient(
        45deg,
        var(--primary) 25%,
        transparent 25%,
        transparent 75%,
        var(--primary) 75%,
        var(--primary)
      ),
      linear-gradient(
        45deg,
        var(--primary) 25%,
        transparent 25%,
        transparent 75%,
        var(--primary) 75%,
        var(--primary)
      );
    background-size: 4px 4px;
    background-position: 0 0, 2px 2px;
  }
</style>

<Window />

<section class="desktop">
  <div class="icon mac"><span>Pez HD</span></div>
  <div class="icon trash"><span>Trash</span></div>
</section>
