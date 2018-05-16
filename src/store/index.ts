import Vue from 'vue'
import Vuex, { ActionTree, MutationTree } from 'vuex'
import userModule from './modules/user'
import caseModule from './modules/case'
import roomModule from './modules/room'
import evidenceModule from './modules/evidence'
import playerModule from './modules/player'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    userModule,
    caseModule,
    roomModule,
    evidenceModule,
    playerModule
  }
})
