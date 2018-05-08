import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { getEviByCaseId } from '../../api/evidence'
import Vue from 'vue'
import Sweetalert2 from 'sweetalert2'

interface State {
  eviList: Array<Evidence>
}

interface Evidence {
  dsrName: string
  dsrStatus: string
  fileAddr: string
  fileName: string
  name: string
  prove: string
}

const state: State = {
  eviList: []
}

// getters
const getters = {
  getEviList: (state: State) => state.eviList
}

// action
const actions = {
  getEviListApi (context: { commit: Commit, state: State }, caseId: string) {
    return new Promise((resolve, reject) => {
      getEviByCaseId(caseId).then(res => {
        if (res.data.state === 100) {
          store.commit(types.SET_EVI_LIST, res.data.result)
          resolve(res)
        } else {
          Sweetalert2({
            type: 'error',
            title: res.data.message
          })
          resolve(res)
        }
      }).catch(error => {
        Sweetalert2({
          type: 'error',
          title: '连接超时，请稍后再试'
        })
        reject(error)
      })
    })
  }
}

const mutations = {
  [types.SET_EVI_LIST] (state: State, eviList: Array<Evidence>) {
    state.eviList = eviList
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
