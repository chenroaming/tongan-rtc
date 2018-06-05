import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import Vue from 'vue'
import RWS from '../../utils/rws'

interface State {
  websocket: RWS | null
}

const state: State = {
  websocket: null
}

const getters = {
  getWebsocket: (state: State) => state.websocket
}

const actions = {
  setWebsocket (context: { commit: Commit, state: State }) {
    store.commit(types.SET_WEBSOCKET, new RWS('wss://court1.ptnetwork001.com/api/voice/ws.jhtml'))
  },
  websocketSend (context: { commit: Commit, state: State }, content: any) {
    state.websocket.send(content)
  }
}

const mutations = {
  [types.SET_WEBSOCKET] (state: State, websocket: RWS) {
    state.websocket = websocket
  }
}

// state.websocket.onclose = () => {
//   console.log('websocket断开')
// }
// state.websocket.onerror = () => {
//   console.log('websocket错误')
// }
// state.websocket.onopen = () => {
//   console.log('websocket链接')
// }

export default {
  state,
  getters,
  actions,
  mutations
}