<script lang="ts">
  import { windows } from '../store';
  import type { Window } from '../types';
  const openWindowByTitle = (value: any) => {
    const win = $windows.find((obj: Window) => {
      return obj.title === value;
    });
    if (win) {
      const i = $windows.indexOf(win);
      $windows[i].visible = true;
    }
  };
</script>

<button type="button" class="icon mac" on:click={() => openWindowByTitle('Pez HD')} >
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path class="svg-prime-fill" d="M6 60v-4H4V4h2V2h52v2h2v52h-2v8H6z"/>
    <path class="svg-alt-fill" d="M10 33V4H6v52h2v6h2V33zm10 27v-2h-8v4h8v-2zm36-1v-3h2V4h-4v40h-2V4H26v40h-2V4h-2v58h34v-3zm-36-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-5V4h-8v4h8V6z"/>
    <path class="svg-prime-fill" d="M38 57v-1h-2v-2h2v2h2v-2h2v2h-2v2h-2v-1zM26 45v-1h26v2H26v-1zm8-6v-1h-2v-2h-2v-4h4v2h2v2h6v-2h2v-2h4v4h-2v2h-2v2H34v-1zm-2-14v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1zm10 0v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1z"/>
    <path class="svg-alt-fill" d="M34 16v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1zm10 5v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1z" />
  </svg>
  <span>Pez HD</span>
</button>
<button type="button" class="icon trash" on:click={() => openWindowByTitle('Garbage')}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path class="svg-alt-fill" d="M14 64v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2z"/>
    <path class="svg-prime-fill" d="M32 64H14v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2H32zm-.002-2h18V10h-36v52h18zM19 58h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zM32 8h20V6H12v2h20zm0-4h6V2H26v2h6z"/>
  </svg>
  <span>Garbage</span>
</button>
