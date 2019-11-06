import { Commit } from 'vuex'
import store from '../index'
import types from '../types'
import { getEviByCaseId } from '../../api/evidence'
import Vue from 'vue'
import Sweetalert2 from 'sweetalert2'

interface State {
  eviList: Array<Evidence>
  eviListFormat: {
    'plaintiff': Array<Evidence>
    'defendant': Array<Evidence>
  }
}

interface Evidence {
  dsrName: string
  dsrStatus: string
  fileAddr: string
  fileName: string
  name: string
  prove: string
}

const state: State = {
  eviList: [],
  eviListFormat: {
    'plaintiff': [],
    'defendant': []
  }
}

// getters
const getters = {
  getEviList: (state: State) => state.eviList,
  getEviListFormat: (state: State) => state.eviListFormat
}

// action
const actions = {
  getEviListApi (context: { commit: Commit, state: State }, caseId: string) {
    return new Promise((resolve, reject) => {
      getEviByCaseId(caseId).then(res => {
        if (res.data.state === 100) {
          store.commit(types.SET_EVI_LIST, res.data.result)
          let obj = {
            'plaintiff': [],
            'defendant': [],
          }

          //2019-8-08新增---开始---
          let caseNoAry =  res.data.result.map(item => {
            return item.caseNo
          })
          caseNoAry = uniq(caseNoAry);
          let onecaseNoAry = []
          for(let y=0;y<caseNoAry.length;y++){
            let caseObj = {
              caseNo:caseNoAry[y],
              eviAry:[]
            }
            for(let i=0;i<res.data.result.length;i++){ 
              if(res.data.result[i].caseNo == caseNoAry[y]){
                if(res.data.result[i].evidence){
                  res.data.result[i].evidence.map(tt => {
                    caseObj.eviAry.push(tt)
                  })
                }   
              }
            }
            onecaseNoAry.push(caseObj)
          }
          console.log(onecaseNoAry)
          onecaseNoAry.map(item => {
            let bj = {
              caseNo:item.caseNo,
              eviAry:[]
            }
            item.eviAry.map((it,dex) => {
              if(it.dsrStatus == '原告'){
                bj.eviAry.push(it)
              }
            })
            obj.plaintiff.push(bj);
          })
           onecaseNoAry.map(item => {
            let bj = {
              caseNo:item.caseNo,
              eviAry:[]
            }
            item.eviAry.map((it,dex) => {
              if(it.dsrStatus == '被告'){
                bj.eviAry.push(it)
              }
            })
            obj.defendant.push(bj);
          })
          //2019-8-08新增---结束---

          // res.data.result.map(item => {
          //   if (item.dsrStatus === '原告') {
          //     obj.plaintiff.push(item)
          //   } else{
          //       obj.defendant.push(item)
          //   }
          // })
          console.log(222222222222222)
          console.log(obj)
          store.commit(types.SET_EVI_LIST_FORMAT, obj)
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

function uniq(array){
  var temp = []; //一个新的临时数组
  for(var i = 0; i < array.length; i++){
      if(temp.indexOf(array[i]) == -1){
          temp.push(array[i]);
      }
  }
  return temp;
}

const mutations = {
  [types.SET_EVI_LIST] (state: State, eviList: Array<Evidence>) {
    state.eviList = eviList
  },
  [types.SET_EVI_LIST_FORMAT] (state: State, eviListFormat) {
    state.eviListFormat = eviListFormat
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
