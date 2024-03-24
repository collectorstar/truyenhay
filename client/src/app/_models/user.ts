export interface User {
  email: string;
  name: string;
  token: string;
  photoUrl: string;
  isAuthor: boolean;
  maxComic: number;
  roles: string[];
}

export interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}
