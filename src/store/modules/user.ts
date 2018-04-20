import { Commit } from 'vuex'
import types from '../types'

export interface State {
  id: number,
  name: string,
  hasLogin: boolean
}

interface UserInfoShape {
  id: number,
  name: string
}

interface LoginForm {
  username: string,
  password: string
}

// initial state
const state: State = {
  id: 1,
  name: 'admin',
  hasLogin: false
}

// getters
const getters = {
  getUserName: (state: State) => state.name
}

// action
const actions = {
  login (context: { commit: Commit, state: State }, loginForm: LoginForm) {
    console.log(loginForm)
    context.commit(types.SET_LOGIN, true)
    context.commit(types.SET_USER_INFO, { id: 2, name: 'Eric' })
  }
}

// mutation
const mutations = {
  [types.SET_USER_INFO] (state: State, userInfo: UserInfoShape) {
    state.id = userInfo.id
    state.name = userInfo.name
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
