import { createRouter, createWebHistory } from 'vue-router'
import Main from '../views/Main.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:mid(\\d+)?',
      name: 'main',
      component: Main,
      props: true
    },
    {
      path: '/:mid(.*index.html)',
      redirect: to => {
        return { path: '/' }
      }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../views/Setting.vue')
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/Help.vue')
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import('../views/Archive.vue')
    }
  ]
})

export default router
