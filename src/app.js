// import App from './App.svelte';
import Menu from './Menu.svelte';
import Desktop from './Desktop.svelte';
import Windows from './Windows.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

// var app = new App({
//   target: replaceContents(document.querySelector('#app')),
// });

var menu = new Menu({
  target: replaceContents(document.querySelector('#menu')),
});

var desktop = new Desktop({
  target: replaceContents(document.querySelector('#desktop')),
});

var windows = new Windows({
  target: replaceContents(document.querySelector('#windows')),
});

export default { menu, desktop, windows };
