import Vue from 'vue'
import { makeHot, reload } from './utils/hot-reload'
import { createRouter } from './router'
import store from './store'
import VueSweetalert2 from 'vue-sweetalert2'

Vue.config.productionTip = false

Vue.use(VueSweetalert2)
// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  router: createRouter(),
  store
})
