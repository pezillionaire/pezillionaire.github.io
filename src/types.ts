export type Theme = {
  alt: string | null;
  primary: string | null;
};

export type MenuItem = {
  name: string;
  type: 'action' | 'link' | 'select' | 'folder';
  url: string | null;
  active?: boolean;
  properties?: Theme;
};

export type Window = {
  title: string;
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
  moving: boolean;
};
