
import Menu from './Menu.svelte'
import Desktop from './Desktop.svelte'
import Windows from './Windows.svelte'

function replaceContents(node: HTMLElement | null) {
  if (node) {
    node.innerHTML = ''
    return node
  }
}

const menu = new Menu({
  target: replaceContents(document.querySelector('#menu')),
})

const desktop = new Desktop({
  target: replaceContents(document.querySelector('#desktop')),
})

const windows = new Windows({
  target: replaceContents(document.querySelector('#windows')),
})

export default { menu, desktop, windows }
