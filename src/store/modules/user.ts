import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { login, getUserInfo } from '../../api/user'
import Vue from 'vue'
import Sweetalert2 from 'sweetalert2'

interface State {
  userInfo: UserInfoShape
  hasLogin: boolean
}

interface UserInfoShape {
  id: number,
  name: string,
  role: string
}

interface LoginForm {
  username: string,
  password: string,
  code: string
}

// initial state
const state: State = {
  hasLogin: false,
  userInfo: {
    id: 1,
    name: '',
    role: ''
  }
}

// getters
const getters = {
  getUserName: (state: State) => state.userInfo.name
}

// action
const actions = {
  login (context: { commit: Commit, state: State }, loginForm: LoginForm) {
    return new Promise((resolve, reject) => {
      login(loginForm.username, loginForm.password, loginForm.code).then(res => {
        if (res.data.state === 100) {
          Sweetalert2({
            type: 'success',
            title: res.data.message,
            showConfirmButton: false,
            timer: 1000
          })

          // 调取用户信息
          store.dispatch('getUserInfo')
        } else {
          Sweetalert2({
            type: 'error',
            title: res.data.message
          })
        }
        resolve(res)
      }).catch(error => {
        Sweetalert2({
          type: 'error',
          title: '连接超时，请稍后再试'
        })
        reject(error)
      })
    })
  },
  getUserInfo (context: { commit: Commit, state: State }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(res => {
        if (res.data.state === 100) {
          let userInfo: UserInfoShape = {
            id: res.data.result.id,
            name: res.data.result.name,
            role: res.data.result.roles[0].name
          }
          store.commit(types.SET_USER_INFO, userInfo)
          store.commit(types.SET_LOGIN, true)
        }
      })
    })
  }
}

// mutation
const mutations = {
  [types.SET_USER_INFO] (state: State, userInfo: UserInfoShape) {
    state.userInfo = userInfo
  },
  [types.SET_LOGIN] (state: State, status: boolean) {
    state.hasLogin = status
  }
}
export default {
  state,
  getters,
  actions,
  mutations
}
