import Vue from 'vue'
import Vuex, { ActionTree, MutationTree } from 'vuex'
import user from './modules/user'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user
  }
})
