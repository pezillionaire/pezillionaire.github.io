export type Window = {
  title: string;
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
  moving: boolean;
};

export type Menu = {
  name: string,
  component: string,
  active: boolean,
  svg?: string
  items: Array<MenuItem | MenuItemLink | MenuItemSelect>,
}

export type MenuItem = {
  name: string;
  type: 'action' | 'link' | 'select' | 'folder';
};

export interface MenuItemSelect extends MenuItem {
  active: boolean;
  properties?: Theme;
};

export interface MenuItemLink extends MenuItem {
  url: string;
};

export type Theme = {
  alt: string | null;
  primary: string | null;
};
