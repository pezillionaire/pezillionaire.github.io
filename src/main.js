import Desktop from './Desktop.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

var desktop = new Desktop({
  target: replaceContents(document.querySelector('#desktop')),
});



export default { desktop };
