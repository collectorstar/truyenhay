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
    routeLink: 'genre-cus',
    label: 'Genre',
    roles: [],
  },
  {
    routeLink: 'find-comic',
    label: 'Find Comic',
    roles: [],
  },
  {
    routeLink: 'history',
    label: 'History',
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
      {
        routeLink: 'admintruyenhay/recommend-comic',
        label: 'Recommend Comics',
        roles: ['Admin'],
      },
      {
        routeLink: 'admintruyenhay/comic-hot',
        label: 'Hot Comics',
        roles: ['Admin'],
      },
      {
        routeLink: 'admintruyenhay/approval-comic',
        label: 'Approval Comic',
        roles: ['Admin'],
      },
      {
        routeLink: 'admintruyenhay/request-inc-max-comic',
        label: 'Request Inc Max Comic',
        roles: ['Admin'],
      },
      {
        routeLink: 'admintruyenhay/approval-chapter',
        label: 'Approval Chapter',
        roles: ['Admin'],
      },
    ],
    class: 'admin-nav'
  },
];
