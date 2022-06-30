<script>
  import { onMount } from 'svelte'
  let date = new Date()
  $: minutes = `0${date.getMinutes()}`.slice(-2)
  $: hours = date.getHours() <= 12 ? date.getHours() : date.getHours() - 12
  $: meridiem = date.getHours() < 12 ? ' AM' : ' PM'
  let tick = ':'

  onMount(() => {
    setInterval(() => {
      date = new Date()
      tick = tick == ':' ? ' ' : ':'
    }, 1000)
  })
</script>

<div id="clock">
  <time datetime={date.toString()}>{hours}{tick}{minutes}{meridiem}</time>
</div>
