import App from './App.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

var app = new App({
  target: replaceContents(document.querySelector('#app')),
});



export default { app };
