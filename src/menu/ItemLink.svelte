<script>
  export let name;
  export let type;
  export let url;

  $: type;
  $: name;
  $: url;
</script>

<a href={url}>
  <span>{name}</span>
  <span class="menuitem-icon">⋮</span>
</a>

<style>
  a {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    text-transform: capitalize;
    white-space: pre;
    line-height: 1.25;
  }
  a span {
    display: inline;
  }
  .menuitem-icon {
    min-width: 1rem;
    margin-left: 2rem;
  }
</style>
