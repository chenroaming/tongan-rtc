import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { resultList } from '../../api/court'
import Sweetalert2 from 'sweetalert2'

interface State {
  resultList: Array<Result>
}

interface Result {
  id: number,
  createDate: any,
  modifyDate: any,
  content: string
  fileName: string
}

const state: State = {
  resultList: []
}

// getters
const getters = {
  getResultList: (state: State) => state.resultList
}

// action
const actions = {
  getResultListApi (context: { commit: Commit, state: State }) {
    return new Promise((resolve, reject) => {
      resultList().then(res => {
        if (res.data.state === 100) {
          store.commit(types.SET_RESULT_LIST, res.data.result)
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
  [types.SET_RESULT_LIST] (state: State, resultList: Array<Result>) {
    state.resultList = resultList
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
