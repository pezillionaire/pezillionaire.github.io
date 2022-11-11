import type { MenuItem, MenuItemLink, MenuItemSelect } from './types';

export const MenuItemsPez: Array<MenuItem> = [
  {
    name: 'This Does Nothing… Yet!',
    type: 'action',
  },
];

export const MenuItemsProjects: Array<MenuItemLink> = [
  {
    name: 'Resume',
    type: 'link',
    url: 'https://github.com/pezillionaire/resume',
  },
  {
    name: 'Gifl.ink',
    type: 'link',
    url: 'https://gifl.ink',
  },
  {
    name: 'Peak Design System',
    type: 'link',
    url: 'https://peak.wealth.bar',
  },
];

export const MenuItemsThemes: Array<MenuItemSelect> = [
  {
    name: 'harmony',
    type: 'select',
    active: true,
    properties: {
      primary: '#0466c8',
      alt: '#e2e7ed',
    },
  },
  {
    name: 'alpenglow',
    type: 'select',
    active: false,
    properties: {
      primary: '#480ca8',
      alt: '#ffc8dd',
    },
  },
  {
    name: 'overcast',
    type: 'select',
    active: false,
    properties: {
      primary: '#222',
      alt: '#bfb8b9',
    },
  },
  {
    name: 'creekside',
    type: 'select',
    active: false,
    properties: {
      primary: '#006d77',
      alt: '#edf6f9',
    },
  },
  {
    name: 'emerald',
    type: 'select',
    active: false,
    properties: {
      alt: '#38b000',
      primary: '#333533',
    },
  },
];
