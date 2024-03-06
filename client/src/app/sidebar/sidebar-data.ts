import { INavbarData } from '../_models/navbarData';

export const sidebarList: INavbarData[] = [
  {
    routeLink: 'dashboard',
    icon: 'fa-solid fa-house',
    label: 'Dashboard',
    roles: [],
  },
  {
    routeLink: 'follow',
    icon: 'fas fa-heart',
    label: 'Follows',
    roles: [],
  },
  {
    routeLink: 'upload-comic',
    icon: 'fa-solid fa-upload',
    label: 'Upload commic',
    roles: ['Member']
  },
  {
    routeLink: 'admintruyenhay/genre',
    icon: 'fa-solid fa-bug',
    label: 'Genre',
    roles: ['Admin'],
  },
  {
    routeLink: 'account-detail',
    icon: 'fa-solid fa-user',
    label: 'Account detail',
    roles: ['Member']
  },
];
