import { INavbarData } from '../_models/navbarData';

export const sidebarList: INavbarData[] = [
  {
    routeLink: 'home',
    label: 'Home',
    roles: [],
  },
  {
    routeLink: 'follow',
    label: 'Follows',
    roles: [],
  },
  {
    routeLink: 'upload-comic',
    label: 'Upload commic',
    roles: ['Member'],
  },
  {
    routeLink: '',
    label: 'Admin',
    roles: ['Admin'],
    items: [
      {
        routeLink: 'admintruyenhay/genre',
        label: 'Genre',
        roles: ['Admin'],
      },
      {
        routeLink: 'admintruyenhay/request-author',
        label: 'Request Author',
        roles: ['Admin'],
      },
    ],
  },
];
