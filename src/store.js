import { writable } from 'svelte/store';

export const windows = writable([
  {
    title: 'PezHD',
    top: 0,
    left: 0,
    visible: true,
  },
  {
    title: 'Garbage',
    top: 0,
    left: 0,
    visible: false,
  },
]);

const pezMenuItems = [
  // {
  //   name: 'About this Pez…',
  //   type: 'action',
  // },

  // {
  //   name: 'Contact',
  //   type: 'link',
  //   url: 'https://github.com/pezillionaire/resume',
  // },
  {
    name: 'This Does Nothing… Yet!',
    type: 'action',
  },
  // {
  //   name: 'Shut\'er Down',
  //   type: 'action',
  // },
];

const ProjectsMenuItems = [
  {
    name: 'Resume',
    type: 'link',
    url: 'https://github.com/pezillionaire/resume',
  },
  {
    name: 'Gifl.ink',
    type: 'link',
    url: 'http://gifl.ink',
  },
  {
    name: 'Peak Design System',
    type: 'link',
    url: 'https://peak.wealth.bar',
  },
];

const ThemesMenuItems = [
  {
    name: 'harmony',
    type: 'select',
    active: true,
    primary: '#0466c8',
    alt: '#e2e7ed',
  },
  {
    name: 'alpinglow',
    type: 'select',
    active: false,
    primary: '#480ca8',
    alt: '#ffc8dd',
  },
  {
    name: 'overcast',
    type: 'select',
    active: false,
    primary: '#222',
    alt: '#bfb8b9',
  },
  {
    name: 'creekside',
    type: 'select',
    active: false,
    primary: '#006d77',
    alt: '#edf6f9',
  },
];

export const menus = writable([
  {
    name: 'Pez',
    component: 'Menu',
    active: false,
    svg: '<svg viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'><path class=\'svg-fill-prime\' d=\'M4 60v-4h4v-4h4v-4h4v-8h-4v-4H8V24h4v-4H8v-4h4v-4h4V8h4V4h8v4h4V4h12v4h4v4h4v4h4v20h-4v4h-4v8h4v4h4v4h4v8h-4v-8h-4v-4H40v4H24v-4H12v4H8v8H4v-4zm36-10v-2h4v-8h4v-4h4V16h-4v-4h-4V8H32v4h-4V8h-8v4h-4v4h-4v4h4v4h-4v12h4v4h4v8h4v4h16v-2zm-16-6v-4h-4v-4h-4v-4h4v-4h-4v-4h4v-4h-4v-4h4v-4h4v4h-4v4h4v4h4v-4h4v4h8v-4h-4v-4h4v-4h4v4h4v4h-4v4h4v4h-4v4h4v4h-4v4h-4v8h-4V36h4v-4h-4v-4H24v4h-4v4h8v12h-4v-4zm0-18v-2h-4v4h4v-2zm20 0v-2h-4v4h4v-2zm0-8v-2h-4v4h4v-2zM16 62v-2h4v4h-4v-2zm28 0v-2h4v4h-4v-2z\'/></svg>',
    items: pezMenuItems,
  },
  {
    name: 'Stuff',
    component: 'Menu',
    active: false,
    items: ProjectsMenuItems,
  },
  {
    name: 'Theme',
    component: 'SelectMenu',
    active: false,
    items: ThemesMenuItems,
  },
]);

export const menusActive = writable(false);
