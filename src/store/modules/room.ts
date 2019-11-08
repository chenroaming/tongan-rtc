import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { getRoomToken } from '../../api/case'
import Vue from 'vue'
import Sweetalert2 from 'sweetalert2'

interface State {
  roomToken: string,
  userId: string,
  message: Array<any>
}

// initial state
const state: State = {
  roomToken: '',
  userId: '',
  message: []
}

// getters
const getters = {
  getRoomToken: (state: State) => state.roomToken,
  getUserId: (state: State) => state.userId,
  getMessage: (state: State) => state.message
}

// action
const actions = {
  getRoomToken (context: { commit: Commit, state: State }, parmas:{caseid : any , roomType : number} ) {
    return new Promise((resolve, reject) => {
      getRoomToken(parmas.caseid,parmas.roomType).then(res => {
        if (res.data.state === 100) {
          resolve(res)
          store.commit(types.SET_ROOM_TOKEN, res.data.result)
          store.commit(types.SET_CASE_ID, parmas.caseid)
        } else {
          
          if(parmas.caseid.indexOf(',') != -1){

          }else{
            Sweetalert2({
              type: 'error',
              title: res.data.message
            })
          }
          
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
  setMessage (context: { commit: Commit, state: State }, message: any) {
    store.commit(types.SET_MESSAGE, message)
  },
  cleanMessage (context: { commit: Commit, state: State }) {
    state.message = []
  }
}

const mutations = {
  [types.SET_ROOM_TOKEN] (state: State, roomToken: string) {
    state.roomToken = roomToken
  },
  [types.SET_USERID] (state: State, userId: string) {
    state.userId = userId
  },
  [types.SET_MESSAGE] (state: State, message: any) {
    state.message.push(message)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
