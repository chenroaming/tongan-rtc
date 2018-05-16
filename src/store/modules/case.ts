import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { caseList } from '../../api/case'
import Vue from 'vue'
import Sweetalert2 from 'sweetalert2'

interface State {
  caseList?: CaseListShape
  caseId?: number
  caseNo?: string
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
  caseList: [],
  caseId: 0,
  caseNo: ''
}

// getters
const getters = {
  getCaseList: (state: State) => state.caseList,
  getCaseId: (state: State) => state.caseId,
  getCaseNo: (state: State) => state.caseNo
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
  },
  setCaseNo (context: { commit: Commit, state: State }, caseNo: string) {
    store.commit(types.SET_CASE_NO, caseNo)
  }
}
const mutations = {
  [types.SET_CASE_LIST] (state: State, caseList: CaseListShape) {
    state.caseList = caseList
  },
  [types.SET_CASE_ID] (state: State, caseId: number) {
    state.caseId = caseId
  },
  [types.SET_CASE_NO] (state: State, caseNo: string) {
    state.caseNo = caseNo
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
