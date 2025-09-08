import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  {
    path: '/series',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SeriesPage.vue') }],
  },

  {
    path: '/movies',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MoviesPage.vue') }],
  },

  {
    path: '/movie/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MovieDetailPage.vue') }],
  },

  {
    path: '/show/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ShowDetailPage.vue') }],
  },

  {
    path: '/auth/callback',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/AuthCallback.vue') }],
  },

  {
    path: '/profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ProfilePage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
