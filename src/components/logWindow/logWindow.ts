import { Component, Vue } from 'vue-property-decorator'
import { Getter,Action } from 'vuex-class'
import { exportLog,uploadRecordFile} from '../../api/export'

import './logWindow.less'

interface UserShape {
  name: string,
  imagePath: string
}

@Component({
  template: require('./logWindow.html')
})
export class logWindow extends Vue {
  name: 'logWindow'
  @Getter('getCaseId') caseId: number
  @Action('websocketSend') send: Function

  

  judge: UserShape = {
    name: '',
    imagePath: ''
  }
  clerk: UserShape = {
    name: '',
    imagePath: ''
  }
  assistant: UserShape = {
    name: '',
    imagePath: ''
  }

  filePath:string =''

  mounted () {

  }
  exportlog(){
    let that = this;
    let fileAddr = this.filePath;
    exportLog(this.caseId).then(res => {
        if (res.data.state === 100) {
          window.open(res.data.result[0])
          // 通知服务端（证据同步投屏）
          let sendObj = { 'name': '', 'roleName': '', 'type': 3, 'wav': '', 'content': res.data.result[0], 'createDate': '' }
          let sendJSON = JSON.stringify(sendObj)
          that.send(sendJSON)
          return false;
          // let eleLink = document.createElement('a')
          // let arr = res.data.result[0].split('/')
          // eleLink.download = arr[arr.length - 1]
          // eleLink.style.display = 'none'
          // eleLink.href = location.origin + res.data.result
          // // 触发点击
          // document.body.appendChild(eleLink)
          // eleLink.click()
          // 然后移除
          // document.body.removeChild(eleLink)
        } else {
          this.$swal({
            type: 'error',
            title: res.data.message
          })
        }
    })
  }
  uploadLog(){
      let that = this;
    let uploads = document.createElement("input");
    // uploads.value = '';
    uploads.type = "file";
    uploads.click();
    console.log(uploads)
    
    uploads.onchange = function(){
        const loading = that.$loading({
            lock: true,
            text: '上传中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.5)'
          });
        var file = uploads.files[0];
        uploadRecordFile(file,that.caseId).then(res => {
            loading.close();
            if(res.data.state == 100){
              that.filePath = res.data.path;
              // 通知服务端（证据同步投屏）
              let sendObj = { 'name': '', 'roleName': '', 'type': 3, 'wav': '', 'content': res.data.path, 'createDate': '' }
              let sendJSON = JSON.stringify(sendObj)
              that.send(sendJSON)
                that.$swal({
                    type: 'success',
                    title: res.data.message
                })
            }else{
                that.$swal({
                    type: 'error',
                    title: res.data.message
                })
            }
        })
        setTimeout(() => {
        loading.close();
        }, 8000);
         
    }
  }
}
