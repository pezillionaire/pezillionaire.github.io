<script>
  import { onMount } from "svelte";
  let date = new Date();

  const formatter = new Intl.DateTimeFormat("en", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  });

  onMount(() => {
    const interval = setInterval(() => {
      date = new Date();
    }, 1000);
  });
</script>

<time datetime={date}>{formatter.format(date)}</time>
