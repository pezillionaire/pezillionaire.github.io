<div id="clock">
  <time datetime={date}>{hours}{tick}{minutes}{meridiem}</time>
</div>

<script>
  import { onMount } from 'svelte';
  let date = new Date();
  let minutes = ('0' + date.getMinutes()).slice(-2);
  let hours = (date.getHours() < 12)? date.getHours() : (date.getHours() - 12);
  let meridiem = (date.getHours() < 12)? " AM" : " PM";
  let tick = ":";

  onMount(() => {
    setInterval(() => {
      date = new Date();
      tick = (tick == ":")? " " : ":";
    }, 1000);
  });
</script>
