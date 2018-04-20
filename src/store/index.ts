import Vue from 'vue'
import Vuex, { ActionTree, MutationTree } from 'vuex'
import getters from './getters'
import user, { State as UserState } from './modules/user'
Vue.use(Vuex)

export default new Vuex.Store({
  getters,
  modules: {
    user
  }
})

export interface State {
  user: UserState
}
