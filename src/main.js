// import App from './App.svelte';
import Clock from './Clock.svelte';

function replaceContents(node) {
  node.innerHTML = '';
  return node;
}

var clock = new Clock({
  target: replaceContents(document.querySelector('#clock')),
});

// var app = new App({
// 	target: replaceContents( document.querySelector( '#app' )),
// });

export default { clock };