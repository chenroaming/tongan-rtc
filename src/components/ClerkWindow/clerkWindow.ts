import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { getResult, addResult, editResult, delResult } from '../../api/court'
import swal from 'sweetalert2'
import RWS from '../../utils/rws'


import './clerkWindow.less'

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
  template: require('./clerkWindow.html'),
})



export class ClerkWindow extends Vue {
  name: 'ClerkWindow'
  @Getter('getCaseId') caseId: number
  @Getter('getWebsocket') websocket: RWS
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Action('getResultListApi') getResultListApi: Function
  @Getter('getResultList') resultList: ResultListShape
  @Action('websocketSend') send: Function
  @Action('setVideoSrcObj') setVideoSrcObj: Function
  @Getter('getclerkRooms') clerkRooms: Array<any>

  showPlaintiff: boolean = true

  callPhone: string = ""
  nowCase: string = ""
  isShowDoc: boolean = true
  shouwup: String = "deil"
  mainClassd: String = "clerk-content2 scrollStyle"
  created () {
    if (this.caseId === 0) {
      this.$router.push({ name: 'loginPage' })
    } else {
      // this.getEviListApi(this.caseId)
    }
  }

  mounted () {
    this.nowCase = this.clerkRooms[0].caseId
    this.getResultListApi()
    // this.callPhone = './../../components/wordCreat/wordRtc.html?caseNo=' + this.nowCase;
    this.callPhone = '/wordRtc.html?caseNo=' + this.nowCase;
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
  cloaseDoc(){
    this.shouwup = "upINdxex"
    this.mainClassd = "clerk-content2 scrollStyle noneDex"
    console.log(this.shouwup)
    let iframe = document.getElementById("iframe");
    var iWindow = (<HTMLIFrameElement> iframe).contentWindow;
    iWindow.postMessage("justUp" , "*");
    this.isShowDoc = false
  }
  showDoc(){
    this.shouwup = "deil"
    this.mainClassd = "clerk-content2 scrollStyle"
    this.isShowDoc = true
    this.setVideoSrcObj(new MediaStream())
    let iframe = document.getElementById("iframe");
    var iWindow = (<HTMLIFrameElement> iframe).contentWindow;
    iWindow.postMessage("showOpen" , "*");
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
  upFile(){
    this.setVideoSrcObj(new MediaStream())
    let iframe = document.getElementById("iframe");
    var iWindow = (<HTMLIFrameElement> iframe).contentWindow;
    iWindow.postMessage("justUp" , "*");
  }
  saveFile(){
    let iframe = document.getElementById("iframe");
    var iWindow = (<HTMLIFrameElement> iframe).contentWindow;
    iWindow.postMessage("justSave" , "*");
  }
  handleClick(tab, event){
    console.log(tab, event)
    console.log(tab.name)
    console.log(tab.label)
    console.log(this.nowCase)
  }
  beforeChange(n,o){
    console.log(9999999999995)
    console.log(n)
    console.log(o)
    if(o == undefined || o == 0){
      
    }else{
      let iframe = document.getElementById('iframe');
      var iWindow = (<HTMLIFrameElement> iframe).contentWindow;
      iWindow.postMessage("justUp" , "*");

      // this.callPhone = './../../components/wordCreat/wordRtc.html?caseNo=' + n;
      this.callPhone = '/wordRtc.html?caseNo=' +n;

      let iframe2 = document.getElementById('iframe');
      var iWindow2 = (<HTMLIFrameElement> iframe2).contentWindow;
      iWindow2.postMessage("showOpen" , "*");
    }
    
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
