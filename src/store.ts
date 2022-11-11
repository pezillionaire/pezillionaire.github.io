import { writable, type Writable } from 'svelte/store';
import type { Window, Menu } from './types';
import { MenuItemsPez, MenuItemsProjects, MenuItemsThemes } from './menus'

export const windows: Writable<Window[]> = writable([
  {
    title: 'Pez HD',
    top: 0,
    left: 0,
    width: null,
    height: null,
    visible: true,
    moving: false,
  },
  {
    title: 'Garbage',
    top: 0,
    left: 0,
    width: null,
    height: null,
    visible: false,
    moving: false,
  },
]);
export const menusActive = writable(false);

export const menus: Writable<Menu[]> = writable([
  {
    name: 'Pez',
    component: 'Menu',
    active: false,
    svg: "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><path class='svg-fill-prime' d='M4 60v-4h4v-4h4v-4h4v-8h-4v-4H8V24h4v-4H8v-4h4v-4h4V8h4V4h8v4h4V4h12v4h4v4h4v4h4v20h-4v4h-4v8h4v4h4v4h4v8h-4v-8h-4v-4H40v4H24v-4H12v4H8v8H4v-4zm36-10v-2h4v-8h4v-4h4V16h-4v-4h-4V8H32v4h-4V8h-8v4h-4v4h-4v4h4v4h-4v12h4v4h4v8h4v4h16v-2zm-16-6v-4h-4v-4h-4v-4h4v-4h-4v-4h4v-4h-4v-4h4v-4h4v4h-4v4h4v4h4v-4h4v4h8v-4h-4v-4h4v-4h4v4h4v4h-4v4h4v4h-4v4h4v4h-4v4h-4v8h-4V36h4v-4h-4v-4H24v4h-4v4h8v12h-4v-4zm0-18v-2h-4v4h4v-2zm20 0v-2h-4v4h4v-2zm0-8v-2h-4v4h4v-2zM16 62v-2h4v4h-4v-2zm28 0v-2h4v4h-4v-2z'/></svg>",
    items: MenuItemsPez,
  },
  {
    name: 'Stuff',
    component: 'Menu',
    active: false,
    items: MenuItemsProjects,
  },
  {
    name: 'Theme',
    component: 'SelectMenu',
    active: false,
    items: MenuItemsThemes,
  },
]);
