import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { login, phoneLogin, logout, getUserInfo, getCode } from '../../api/user'
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
  password?: string,
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
  getUserName: (state: State) => state.userInfo.name,
  getLoginState: (state: State) => state.hasLogin,
  getUserInfo: (state: State) => state.userInfo
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
          // 标记用户已登录
          store.commit(types.SET_LOGIN, true)
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
  phoneLogin (context: { commit: Commit, state: State }, loginForm: LoginForm) {
    return new Promise((resolve, reject) => {
      phoneLogin(loginForm.username, loginForm.password, loginForm.code).then(res => {
        if (res.data.state === 100) {
          Sweetalert2({
            type: 'success',
            title: res.data.message,
            showConfirmButton: false,
            timer: 1000
          })
          // 标记用户已登录
          store.commit(types.SET_LOGIN, true)
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
  logout (context: { commit: Commit, state: State }) {
    return new Promise((resolve, reject) => {
      logout().then(res => {
        if (res.data.state === 100) {
          Sweetalert2({
            type: 'success',
            title: res.data.message,
            showConfirmButton: false,
            timer: 1000
          })
          store.commit(types.SET_LOGIN, false)
        } else {
          Sweetalert2({
            type: 'error',
            title: res.data.message
          })
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
  getUserInfo (context: { commit: Commit, state: State }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(res => {
        if (res.data.state === 100) {
          let userInfo: UserInfoShape = {
            id: res.data.result.id,
            name: res.data.result.name || res.data.result.username,
            role: res.data.result.roles[0].name
          }
          store.commit(types.SET_USER_INFO, userInfo)
          store.commit(types.SET_LOGIN, true)
        } else {
          store.commit(types.SET_LOGIN, false)
        }
      })
    })
  },
  getCode (context: { commit: Commit, state: State }, phone: string) {
    return new Promise((resolve, reject) => {
      getCode(phone).then(res => {
        if (res.data.state === 100) {
          Sweetalert2({
            type: 'success',
            title: res.data.message,
            showConfirmButton: false,
            timer: 1000
          })
        } else {
          Sweetalert2({
            type: 'error',
            title: res.data.message
          })
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
