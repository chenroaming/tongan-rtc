import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { uploadEvi, examineEvi, getEviNote } from '../../api/evidence'
import swal from 'sweetalert2'
import RWS from '../../utils/rws'

import './evidenceWindow.less'

interface UserInfoShape {
  id: number,
  name: string,
  role: string
}

@Component({
  template: require('./evidenceWindow.html')
})
export class EvidenceWindow extends Vue {
  name: 'EvidenceWindow'
  @Getter('getCaseId') caseId: number
  @Getter('getEviList') eviList: Array<any>
  @Getter('getEviListFormat') eviListFormat: Object
  @Getter('getWebsocket') websocket: RWS
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Action('getEviListApi') getEviListApi: Function
  @Action('websocketSend') send: Function

  showPlaintiff: boolean = true

  created () {
    if (this.caseId === 0) {
      this.$router.push({ name: 'loginPage' })
    } else {
      this.getEviListApi(this.caseId)
    }
  }

  examineEvi (evidenceId, exm) {
    examineEvi(evidenceId, exm)
  }

  openEvi (fileAddr) {
    let arr = fileAddr.split('/')
    let filename = arr[arr.length - 1]
    function checkImg (filename) {
      let index = filename.indexOf('.')
      filename = filename.substring(index)
      if (filename !== '.bmp' && filename !== '.png' && filename !== '.gif' && filename !== '.jpg' && filename !== '.jpeg') {  //根据后缀，判断是否符合图片格式
        return false
      } else {
        return true
      }
    }

    function checkPDF (filename) {
      let index = filename.indexOf('.')
      filename = filename.substring(index)
      if (filename !== '.pdf') {
        return false
      } else {
        return true
      }
    }

    if (checkImg(filename)) {
      const src = 'https://dq.hlcourt.gov.cn' + fileAddr
      swal({
        html: `<img src="${src}" width="600px" />`,
        width: '750px',
        confirmButtonText: '关闭'
      })
    } else if (checkPDF(filename)) {
      const src = fileAddr
      swal({
        html: `<iframe src="${src}" width="650" height="400" frameborder="0" style="object-fit: fill;"></iframe>`,
        width: '750px',
        confirmButtonText: '关闭'
      })
    } else {
      const src = 'https://view.officeapps.live.com/op/view.aspx?src=https://dq.hlcourt.gov.cn' + fileAddr
      swal({
        html: `<iframe src="${src}" width="650" height="400" frameborder="0" style="object-fit: fill;"></iframe>`,
        width: '750px',
        confirmButtonText: '关闭'
      })
    }

    // 通知服务端（证据同步投屏）
    let sendObj = { 'name': '', 'roleName': '', 'type': 3, 'wav': '', 'content': fileAddr, 'createDate': '' }
    let sendJSON = JSON.stringify(sendObj)
    this.send(sendJSON)
  }

  downEviNote () {
    getEviNote(this.caseId).then(res => {
      if (res.data.state === 100) {
        let src = res.data.result.path
        swal({
          html: `<iframe src="${src}" width="650" height="400" frameborder="0" style="object-fit: fill;"></iframe>`,
          width: '750px',
          confirmButtonText: '关闭'
        })
      } else {
        swal({
          title: '提示',
          text: res.data.message,
          type: 'warning',
          confirmButtonText: '关闭'
        })
      }
    })
  }

  showUpload () {
    this.$swal.queue([{
      title: '证据名称',
      text: '请输入证据名称',
      input: 'text',
      confirmButtonText: '下一步',
      preConfirm: (text) => {
        let formdata = new FormData()
        formdata.append('lawCaseId', String(this.caseId))
        formdata.append('eviname', text)
        this.$swal.insertQueueStep({
          title: '证据对象',
          text: '请输入证据对象即证明了什么',
          input: 'text',
          confirmButtonText: '下一步',
          preConfirm: (text) => {
            formdata.append('eviprove', text)
            this.$swal.insertQueueStep({
              title: '证据来源',
              text: '请输入证据来源',
              input: 'text',
              confirmButtonText: '下一步',
              preConfirm: (text) => {
                formdata.append('evisource', text)
                this.$swal.insertQueueStep({
                  title: '上传文件',
                  input: 'file',
                  confirmButtonText: '上传',
                  preConfirm: (file) => {
                    formdata.append('file', file)
                    return uploadEvi(formdata).then(res => {
                      if (res.data.state === 100) {
                        this.$swal.insertQueueStep({
                          type: 'success',
                          title: '上传成功'
                        })
                      } else {
                        this.$swal.insertQueueStep({
                          type: 'error',
                          title: res.data.message
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    }])
  }
}
