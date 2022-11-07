<script lang="ts">
  export let name: string;
  export let type: string;
  export let url: string | null;

  $: type;
  $: name;
  $: url;
</script>

<a href={url}>
  <span>{name}</span>
  <span class="menuitem icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <path
        class="svg-fill-prime"
        d="M0 7V0h8v4H6V2H2v10h4v-2h2v4H0V7zm10 3V8H4V6h6V2h2v2h2v2h2v2h-2v2h-2v2h-2v-2z"
      />
    </svg>
  </span>
</a>
