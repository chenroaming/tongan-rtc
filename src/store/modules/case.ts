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
  pageNumber?: number
  selectedCase?: Array<any>
  clerkBatcnRooms?: Array<any>
  clerkRooms?: Array<any>
  selectAllCase: boolean,
}

interface CaseListShape {
  [index: number]: CaseObjectShape
}

interface stateData {
  state:boolean,
}

interface selectData {
  caseList:Array<any>,
}

interface CaseObjectShape {
  id: number,
  caseNo: string,
  isOpen: number
}
interface SearchForm {
  caseNo: string,
  pageNumber: number,
}

// initial state
const state: State = {
  caseList: [],
  caseId: 0,
  caseNo: '',
  selectedCase:[],
  clerkBatcnRooms:[],
  clerkRooms:[],
  selectAllCase:false,
  pageNumber:1
}

// getters
const getters = {
  getCaseList: (state: State) => state.caseList,
  getCaseId: (state: State) => state.caseId,
  getCaseNo: (state: State) => state.caseNo,
  getSelectedCase: (state: State) => state.selectedCase,
  getclerkBatcnRooms: (state: State) => state.clerkBatcnRooms,
  getclerkRooms: (state: State) => state.clerkRooms,
  getSelectAllCase: (state: State) => state.selectAllCase,
}

// action
const actions = {
  searchCaseList (context: { commit: Commit, state: State },searchForm:{caseNo : string , pageNumber : number} ) {
    return new Promise((resolve, reject) => {
      caseList(searchForm.caseNo,searchForm.pageNumber).then(res => {
        if (res.data.state === 100) {
          let data=res.data;
          let dataMap = data.openRoom;
          let ary = [];
          for(var key in dataMap){
            var value = dataMap[ key ]; 
            
            value.map(it => {
              it.roomKey = key;
            })
            ary.push(value)
          }
          state.clerkBatcnRooms = ary;
          console.log(state.clerkBatcnRooms);
          data.result.forEach((item,index) => {
              item.checked=false;
          });
          let num=0;
          console.log(state.selectedCase)
            for(let item of state.selectedCase){
              for(let item1 of data.result){
                if(item.caseId==item1.caseId){
                  item1.checked=true;
                  num++
                  break
                }
              }
            }
            if(num==7){//是否全选
              state.selectAllCase=true
            }else{
              state.selectAllCase=false
            }
          store.commit(types.SET_CASE_LIST, res.data.result)
          resolve(res)
        } else {
          Sweetalert2({
            type: 'error',
            title: res.data.message
          })
          resolve(res)
        }
      })
    })
  },
  setCaseNo (context: { commit: Commit, state: State }, caseNo: string) {
    store.commit(types.SET_CASE_NO, caseNo)
  },
  setSelectList (context: { commit: Commit, state: State }, data:selectData) {
    store.commit(types.SET_CASE_LIST_SELECTED, data.caseList)
  },
  setSelectAllRes (context: { commit: Commit, state: State }, data:stateData) {
    store.commit(types.SET_SELECTRES, data.state)
  },
  setclerkRooms (context: { commit: Commit, state: State }, data:selectData) {
    store.commit(types.SET_CLERK_ROOMS, data.caseList)
  },
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
  },
  [types.SET_CASE_LIST_SELECTED] (state: State, caseListEnd: Array<any>) {
    state.selectedCase = caseListEnd
  },
  [types.SET_SELECTRES] (state: State, res: boolean) {
    state.selectAllCase = res
  },
  [types.SET_CLERK_ROOMS] (state: State, clerkrooms: Array<any>) {
    state.clerkRooms = clerkrooms
  },
}

export default {
  state,
  getters,
  actions,
  mutations
}
