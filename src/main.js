import Desktop from './Desktop.svelte';
import Clock from './Clock.svelte';
import Nav from './Nav.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

var nav = new Nav({
  target: replaceContents(document.querySelector('#nav')),
});

var clock = new Clock({
  target: replaceContents(document.querySelector('#clock')),
});

var desktop = new Desktop({
  target: replaceContents(document.querySelector('#desktop')),
});

export default { clock, desktop, nav };
