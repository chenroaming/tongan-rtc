import { GetterTree, Getter } from 'vuex'
import { State } from './index'

const userInfo: Getter<State, any> = (state: State) => {
  return state.user
}

const getters: GetterTree<any, any> = {
  userInfo
}

export default getters
