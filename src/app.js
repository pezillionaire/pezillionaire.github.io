import App from './App.svelte';
import Nav from './Nav.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

var app = new App({
  target: replaceContents(document.querySelector('#app')),
});

var nav = new Nav({
  target: replaceContents(document.querySelector('#nav')),
});

export default { app, nav };
