import Vue from 'vue'
import { makeHot, reload } from './utils/hot-reload'
import { createRouter } from './router'
import store from './store'
import VueSweetalert2 from 'vue-sweetalert2'
import { formatDate } from './utils/date'

Vue.config.productionTip = false

Vue.use(VueSweetalert2)
Vue.filter('formatDate', function (time) {
  let date = new Date(time)
  return formatDate(date, 'hh:mm:ss')
})
// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  router: createRouter(),
  store
})
