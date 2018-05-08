import Vue, { AsyncComponent } from 'vue'
import VueRouter, { Location, Route, RouteConfig } from 'vue-router'
import { makeHot, reload } from '../utils/hot-reload'

const loginPage = () => import('../views/LoginPage').then(({ LoginPage }) => LoginPage)
const roomPage = () => import('../views/RoomPage').then(({ RoomPage }) => RoomPage)
const testPage = () => import('../views/TestPage').then(({ TestPage }) => TestPage)

if (process.env.ENV === 'development' && module.hot) {
  makeHot('../views/LoginPage', loginPage, module.hot.accept('../views/LoginPage', () => reload('../views/LoginPage', (require('../views/LoginPage') as any).LoginPage)))
  makeHot('../views/RoomPage', roomPage, module.hot.accept('../views/RoomPage', () => reload('../views/RoomPage', (require('../views/RoomPage') as any).RoomPage)))
  makeHot('../views/TestPage', testPage, module.hot.accept('../views/TestPage', () => reload('../views/TestPage', (require('../views/TestPage') as any).TestPage)))
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
  },
  {
    name: 'testPage',
    path: '/testPage',
    component: testPage
  }
]

export const createRouter = () => new VueRouter({ mode: 'hash', routes: createRoutes() })
