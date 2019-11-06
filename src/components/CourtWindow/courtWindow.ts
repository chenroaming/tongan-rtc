import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { getResult, addResult, editResult, delResult } from '../../api/court'
import swal from 'sweetalert2'
import RWS from '../../utils/rws'

import './courtWindow.less'

interface UserInfoShape {
  id: number,
  name: string,
  role: string
}

interface ResultListShape {
  resultList: Array<Result>
}

interface Result {
  id: number,
  createDate: any,
  modifyDate: any,
  content: string
  fileName: string
}

@Component({
  template: require('./courtWindow.html')
})
export class CourtWindow extends Vue {
  name: 'CourtWindow'
  @Getter('getCaseId') caseId: number
  @Getter('getWebsocket') websocket: RWS
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Action('getResultListApi') getResultListApi: Function
  @Getter('getResultList') resultList: ResultListShape
  @Action('websocketSend') send: Function

  showPlaintiff: boolean = true

  created () {
    if (this.caseId === 0) {
      this.$router.push({ name: 'loginPage' })
    } else {
      // this.getEviListApi(this.caseId)
    }
  }

  mounted () {
    this.getResultListApi()
  }

  openResult (id) {
    getResult(id).then(res => {
      swal({
        title: '<small>文本</small>',
        width: '850px',
        html: `<div style="text-align: left;font-size: 20px;font-weight: 700;">标题：<div style="display: inline-block;text-align: center;width: 90%;">${res.data.result.fileName}</div></div>
        <div style="text-align: left;font-size: 20px;margin-top: 10px;font-weight: 700;">内容：</div>
        <textarea class="swal2-textarea" disabled style="display: flex;height:350px;" id="courtContent">${res.data.result.content}</textarea>`,
        confirmButtonText: '关闭'
      })
    })
  }

  delResult (id) {
    delResult(id).then(res => {
      if (res.data.state === 100) {
        swal({
          title: '删除成功',
          type: 'success',
          timer: 1500
        })
      } else {
        swal({
          title: res.data.message,
          type: 'error',
          timer: 1500
        })
      }
    })
  }

  editResult (id) {
    getResult(id).then(res => {
      swal({
        title: '<small>编辑文本</small>',
        width: '850px',
        html: `<input class="swal2-input" id="editCourtTitle" placeholder="请输入文本标题" value="${res.data.result.fileName}" type="text" style="display: flex;">
        <textarea class="swal2-textarea" placeholder="请输入文本内容" style="display: flex;height:350px;" id="editCourtContent">${res.data.result.content}</textarea>`,
        showCancelButton: true,
        confirmButtonText: '发布',
        cancelButtonText: '取消',
        allowOutsideClick: false,
        preConfirm: () => {
          let title = document.getElementById('editCourtTitle') as HTMLFormElement
          let content = document.getElementById('editCourtContent') as HTMLFormElement
          if (title.value === '') {
            swal.showValidationError(
              `请输入标题!`
            )
          } else if (content.value === '') {
            swal.showValidationError(
              `请输入笔录内容!`
            )
          } else {
            editResult(id, title.value, content.value).then(res => {
              if (res.data.state === 100) {
                swal({
                  title: '发布成功',
                  type: 'success',
                  confirmButtonText: '关闭'
                })
              }
            })
          }
        }
      })
    })
  }

  editCourtNote () {
    let that = this
    swal({
      title: '<small>编辑文本</small>',
      width: '850px',
      html: `<input class="swal2-input" id="courtTitle" placeholder="请输入文本标题" type="text" style="display: flex;">
      <textarea class="swal2-textarea" placeholder="请输入文本内容" style="display: flex;height:350px;" id="courtContent"></textarea>`,
      showCancelButton: true,
      confirmButtonText: '发布',
      cancelButtonText: '取消',
      allowOutsideClick: false,
      preConfirm: () => {
        let title = document.getElementById('courtTitle') as HTMLFormElement
        let content = document.getElementById('courtContent') as HTMLFormElement
        if (title.value === '') {
          swal.showValidationError(
            `请输入标题!`
          )
        } else if (content.value === '') {
          swal.showValidationError(
            `请输入笔录内容!`
          )
        } else {
          addResult(title.value, content.value).then(res => {
            if (res.data.state === 100) {
              swal({
                title: '发布成功',
                type: 'success',
                confirmButtonText: '关闭'
              })
            }
          })
        }
      }
    })
  }
}
