import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
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
  isOpen: boolean =false
  isOpen2: boolean =false
  openCase: string =''
  openCase2: string =''
  nowType:string =''
  nowType2:string =''

  

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

  openEvi (filesAddr) {
    let that = this
    let index = 0
    let { fileAddr, fileName,fileType } = filesAddr[index]
    fileName = fileType;

    function checkImg (fileName) {
      let index = fileName.indexOf('.')
      fileName = fileName.substring(index)
      if (fileName !== 'bmp' && fileName !== 'png' && fileName !== 'gif' && fileName !== 'jpg' && fileName !== 'jpeg') {  // 根据后缀，判断是否符合图片格式
        return false
      } else {
        return true
      }
    }

    function checkPDF (fileName) {
      let index = fileName.indexOf('.')
      fileName = fileName.substring(index)
      if (fileName !== 'pdf') {
        return false
      } else {
        return true
      }
    }
    function openEviEvent () {
      let html, src
      if (checkImg(fileName)) {
        if(fileAddr.indexOf("http") != -1){
          src =  fileAddr
        }else{
          src =location.origin + fileAddr
        }
        // src = location.origin + fileAddr
        html = `<img src="${src}" width="700px" />`
      } else if (checkPDF(fileName)) {
        src = fileAddr
        html = `<iframe src="${src}" width="750" height="450" frameborder="0" style="object-fit: fill;"></iframe>`
      } else {
        if(fileAddr.indexOf("http") != -1){
          src = 'https://view.officeapps.live.com/op/view.aspx?src=' +  fileAddr
        }else{
          src = 'https://view.officeapps.live.com/op/view.aspx?src=' + location.origin + fileAddr
        }
        // src = 'https://view.officeapps.live.com/op/view.aspx?src=' + location.origin + fileAddr
        html = `<iframe src="${src}" width="750" height="450" frameborder="0" style="object-fit: fill;"></iframe>`
      }
      if (filesAddr.length !== 1) {
        swal({
          html: html,
          width: '850px',
          showCancelButton: true,
          confirmButtonColor: index === filesAddr.length - 1 ? '#aaa' : '#3085d6',
          cancelButtonColor: index === 0 ? '#aaa' : '#3085d6',
          confirmButtonText: index === filesAddr.length - 1 ? '关闭' : '下一个',
          cancelButtonText: index === 0 ? '关闭' : '上一个',
          reverseButtons: true
        }).then((result) => {
          if (result.value) {
            index++
          } else {
            index--
          }
          if (index !== filesAddr.length && (index > 0 || index === 0)) {
            ({ fileAddr, fileName } = filesAddr[index])
            openEviEvent()
          }
        })
      } else {
        swal({
          html: html,
          width: '850px',
          confirmButtonText: '关闭'
        })
      }

      // 通知服务端（证据同步投屏）
      let sendObj = { 'name': '', 'roleName': '', 'type': 3, 'wav': '', 'content': fileAddr, 'createDate': '' }
      let sendJSON = JSON.stringify(sendObj)
      that.send(sendJSON)
    }

    openEviEvent()
  }
  showEvi(caseNo,isOpen,type){
    if(isOpen){
      switch (type) {
        case "plaintiff":
          this.openCase=caseNo;
          this.isOpen=false
          this.nowType=type
        break;
        case "defendant":
          this.openCase2=caseNo;
          this.isOpen2=false
          this.nowType2=type
        break;
      }
    }else{
       switch (type) {
         case "plaintiff":
           this.openCase=caseNo;
           this.isOpen=true
           this.nowType=type
         break;
         case "defendant":
           this.openCase2=caseNo;
           this.isOpen2=true
           this.nowType2=type
         break;
       }
    }
 }
 
  downEviNote () {
    console.log(99999)
    // console.log(this.caseId.indexOf(',') != -1);
    if(this.caseId.indexOf(',') != -1){
      this.$emit('opens')
    }else{
      getEviNote(this.caseId).then(res => {
        if (res.data.state === 100) {
          let src = res.data.result.path
          swal({
            html: `<iframe src="${src}" width="750" height="450" frameborder="0" style="object-fit: fill;"></iframe>`,
            width: '850px',
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
