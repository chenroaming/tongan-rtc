import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { uploadEvi } from '../../api/evidence'

import './evidenceWindow.less'

@Component({
  template: require('./evidenceWindow.html')
})
export class EvidenceWindow extends Vue {
  name: 'EvidenceWindow'
  @Getter('getCaseId') caseId: number
  @Getter('getEviList') eviList: Array<any>
  @Action('getEviListApi') getEviListApi: Function

  created () {
    if (this.caseId === 0) {
      this.$router.push({ name: 'loginPage' })
    } else {
      this.getEviListApi(this.caseId)
    }
  }

  showUpload () {
    this.$swal.queue([{
      title: '证据对象',
      text: '请输入证据对象即证明了什么',
      input: 'text',
      confirmButtonText: '下一步',
      preConfirm: (text) => {
        let formdata = new FormData()
        formdata.append('lawCaseId', String(this.caseId))
        formdata.append('eviprove', text)
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
    }])
  }
}
