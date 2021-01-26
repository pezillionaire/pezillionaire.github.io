import Desktop from './Desktop.svelte';
import Clock from './Clock.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

var clock = new Clock({
  target: replaceContents(document.querySelector('#clock')),
});

var desktop = new Desktop({
  target: replaceContents(document.querySelector('#desktop')),
});

export default { clock, desktop };