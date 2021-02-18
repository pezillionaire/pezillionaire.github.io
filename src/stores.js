import { writable } from 'svelte/store';

const pezMenuItems = [
  // {
  //   name: 'About this Pez…',
  //   type: 'action',
  // },
  {
    name: 'Resume',
    type: 'link',
    url: 'https://github.com/pezillionaire/resume',
  },
  {
    name: 'Contact',
    type: 'link',
    url: 'https://github.com/pezillionaire/resume',
  },
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
    svg: '<svg viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M20 4.433h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-28 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-36 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-44 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-44 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-36 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-36 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-44 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-52 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4\'/></svg>',
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
