import MenuBar from './apps/MenuBar.svelte';
import Desktop from './apps/Desktop.svelte';
import Windows from './apps/Windows.svelte';

function replaceContents(node: HTMLElement | null) {
  if (node) {
    node.innerHTML = '';
    return node;
  }
}

const menu = new MenuBar({
  target: replaceContents(document.querySelector('#menu')),
});

const desktop = new Desktop({
  target: replaceContents(document.querySelector('#desktop')),
});

const windows = new Windows({
  target: replaceContents(document.querySelector('#windows')),
});

export default { menu, desktop, windows };
