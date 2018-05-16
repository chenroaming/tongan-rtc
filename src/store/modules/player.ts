import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import Vue from 'vue'

interface State {
  videoSrcObj: MediaStream
}

const state: State = {
  videoSrcObj: new MediaStream()
}

const getters = {
  getVideoSrcObj: (state: State) => state.videoSrcObj
}

const actions = {
  setVideoSrcObj (context: { commit: Commit, state: State }, videoSrcObj: MediaStream) {
    store.commit(types.SET_VIDEO_SRC_OBJ, videoSrcObj)
  }
}

const mutations = {
  [types.SET_VIDEO_SRC_OBJ] (state: State, videoSrcObj: MediaStream) {
    state.videoSrcObj = videoSrcObj
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
