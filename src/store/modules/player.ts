import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import Vue from 'vue'

interface State {
  videoSrcObj: MediaStream,
  mainInfo: any
}

const state: State = {
  videoSrcObj: new MediaStream(),
  mainInfo: {}
}

const getters = {
  getVideoSrcObj: (state: State) => state.videoSrcObj,
  getMainInfo: (state: State) => state.mainInfo
}

const actions = {
  setVideoSrcObj (context: { commit: Commit, state: State }, videoSrcObj: MediaStream) {
    store.commit(types.SET_VIDEO_SRC_OBJ, videoSrcObj)
  },
  setMainInfo (context: { commit: Commit, state: State }, mainInfo: any) {
    store.commit(types.SET_MAININFO, mainInfo)
  }
}

const mutations = {
  [types.SET_VIDEO_SRC_OBJ] (state: State, videoSrcObj: MediaStream) {
    state.videoSrcObj = videoSrcObj
  },
  [types.SET_MAININFO] (state: State, mainInfo: any) {
    state.mainInfo = mainInfo
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
