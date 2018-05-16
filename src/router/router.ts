import Vue, { AsyncComponent } from 'vue'
import VueRouter, { Location, Route, RouteConfig } from 'vue-router'
import { makeHot, reload } from '../utils/hot-reload'
import store from '../store/index'

const loginPage = () => import('../views/LoginPage').then(({ LoginPage }) => LoginPage)
const roomPage = () => import('../views/RoomPage').then(({ RoomPage }) => RoomPage)

if (process.env.ENV === 'development' && module.hot) {
  makeHot('../views/LoginPage', loginPage, module.hot.accept('../views/LoginPage', () => reload('../views/LoginPage', (require('../views/LoginPage') as any).LoginPage)))
  makeHot('../views/RoomPage', roomPage, module.hot.accept('../views/RoomPage', () => reload('../views/RoomPage', (require('../views/RoomPage') as any).RoomPage)))
}

Vue.use(VueRouter)

export const createRoutes: () => RouteConfig[] = () => [
  {
    name: 'loginPage',
    path: '/',
    component: loginPage
  },
  {
    name: 'roomPage',
    path: '/roomPage',
    component: roomPage
  }
]

export const router = new VueRouter({ mode: 'hash', routes: createRoutes() })

router.beforeEach((to, from, next) => {
  if (to.name === 'loginPage') {
    store.dispatch('getUserInfo')
    next()
  }
  if (to.name !== 'loginPage' && !store.getters.getLoginState) {
    next({
      name: 'loginPage'
    })
  } else {
    next()
  }
})