<script>
  import { onMount } from 'svelte';
  let date = new Date();
  $: hour = date.getHours();
  $: getMin = date.getMinutes();
  let dayOrNight = 'AM';
  let min = 30;

  onMount( () => {
    const interval = setInterval(() => {
    date = new Date();
    dayOrNight = (hour >= 12) ? "PM" : "AM";
    min = (getMin >= 10) ? getMin : `0${getMin}`;
    }, 1000);
  });
</script>
<time datetime="{date}">{hour}:{min}</time>
