import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { caseList } from '../../api/case'
import Vue from 'vue'
import Sweetalert2 from 'sweetalert2'

interface State {
  caseList?: CaseListShape
}

interface CaseListShape {
  [index: number]: CaseObjectShape
}

interface CaseObjectShape {
  id: number,
  caseNo: string,
  isOpen: number
}

// initial state
const state: State = {
  caseList: []
}

// getters
const getters = {
  getCaseList: (state: State) => state.caseList
}

// action
const actions = {
  searchCaseList (context: { commit: Commit, state: State }, caseNo: string) {
    return new Promise((resolve, reject) => {
      caseList(caseNo).then(res => {
        if (res.data.state === 100) {
          store.commit(types.SET_CASE_LIST, res.data.result)
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
  [types.SET_CASE_LIST] (state: State, caseList: CaseListShape) {
    state.caseList = caseList
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
