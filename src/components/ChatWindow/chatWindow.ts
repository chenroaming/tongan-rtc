import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
import { HZRecorder } from '../../utils/recorder'
import { getResult } from '../../api/court'
import { exportLog } from '../../api/export'
import { createImg } from '../../api/case'
import RWS from '../../utils/rws'
import swal from 'sweetalert2'

import './chatWindow.less'

interface UserInfoShape {
  id: number,
  name: string,
  role: string
}

@Component({
  template: require('./chatWindow.html')
})
export class ChatWindow extends Vue {
  name: 'ChatWindow'
  @Getter('getCaseId') caseId: number
  @Getter('getMessage') logMessage: Array<any>
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Getter('getWebsocket') websocket: RWS
  @Action('setMessage') setMessage: Function
  @Action('websocketSend') send: Function
  @Action('getEviListApi') getEviListApi: Function
  @Getter('getEviList') eviList: Array<any>
  @Action('cleanMessage') cleanMsg: Function
  @Action('getResultListApi') getResultListApi: Function
  show: boolean = false
  windowIsShow: boolean = true
  rec: any = {}
  recStatus: boolean = false
  recStae:boolean = false
  shotShow: boolean = true
  timeout: number = 30000
  lockReconnect: boolean = false
  emptyCheckCount: number = 0
  emptydatacount: number = 0
  emptyData: boolean = true
  bufferCount: number = 0
  message: string = ''
  audio: HTMLAudioElement = new Audio()
  AIType: number = 1

  mounted () {
    console.log(this.caseId+"11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111")
    if (this.caseId===24) {
        this.windowIsShow=true
    }
    let contentEl = this.$refs.content as HTMLElement
    this.$nextTick(() => {
      contentEl.scrollTop = contentEl.scrollHeight
    })

    let that = this

    // 监听websocket事件
    this.initWebsocketEvent()
    // 获取语音对象
    navigator.getUserMedia({ audio: true }, function (stream) {
      console.log(stream)
      that.rec = new HZRecorder(stream, {})  //音频处理对象
      // 监听语音输入 是否为空
      that.rec.recorder.onaudioprocess = function (e) {    //音频采集
        let data = e.inputBuffer.getChannelData(0)
        that.rec.audioData.input(data)  // 存录音到 HZRecorder 录音处理对象
        if (!that.emptyData) {
          // console.log('vol')
        }
        let l = Math.floor(data.length / 10)
        let vol = 0  //声音大小
        for (let i = 0; i < l; i++) {
          vol += Math.abs(data[i * 10])   //计算出声音大小
        }
        that.emptyCheckCount++   //
        that.bufferCount++   //
        if (vol < 20) {   //如果声音小于20
          that.emptydatacount++
          if (that.emptydatacount > 10) {   //声音小于20的次数大于10的时候，把录音文件发送出去
            if (!that.emptyData) {  //不为空
              console.log('stoped')
              that.emptydatacount = 0
              that.emptyData = true
              let blob = that.rec.audioData.encodeWAV() //获取音频数据
              that.send(blob)
              console.log(blob)
              that.rec.audioData.buffer = []
              that.rec.audioData.size = 0
              that.bufferCount = 0
            } 
            else {
              // console.log(that.bufferCount)
              if (that.bufferCount > 5) {
                that.rec.audioData.buffer = []
                that.rec.audioData.size = 0
                that.bufferCount = 0
              }
            }
            return
          }

        } else {
          that.emptydatacount = 0
          that.emptyData = false
          // let blob = that.rec.audioData.encodeWAV()
          // console.log(blob)
          // that.send(blob)
          // that.rec.audioData.buffer = []
          // that.rec.audioData.size = 0
        }
        return
      }
      that.start()
    }, function (error) {
      switch (error.name) {
        case 'PERMISSION_DENIED':
        case 'PermissionDeniedError':
          HZRecorder.throwError('用户拒绝提供信息。')
          break
        case 'NOT_SUPPORTED_ERROR':
        case 'NotSupportedError':
          HZRecorder.throwError('浏览器不支持硬件设备。')
          break
        case 'MANDATORY_UNSATISFIED_ERROR':
        case 'MandatoryUnsatisfiedError':
          HZRecorder.throwError('无法发现指定的硬件设备。')
          break
        default:
          HZRecorder.throwError('无法打开麦克风。异常信息:' + (error.name))
          break
      }
    })
  }

handleTrigger (e) {
    if (this.recStatus) {
        this.recStatus = false
        this.recStae = true
        this.stop()
        if (this.userInfo.role === '法官') {
            piliRTC.stopMergeStream()
            let sendObj = { 'name': '', 'roleName': '', 'type': 6, 'wav': '', 'content': 0, 'createDate': '' }
            let sendJSON = JSON.stringify(sendObj)
            this.send(sendJSON)
            exportLog(this.caseId).then(res => {
                console.log(res)
            })
        }
    } else {
        this.start()
        this.recStatus = true
        this.recStae = false
        if (this.userInfo.role === '法官') {
            piliRTC.setDefaultMergeStream(1280, 720)
            let sendObj = { 'name': '', 'roleName': '', 'type': 6, 'wav': '', 'content': 1, 'createDate': '' }
            let sendJSON = JSON.stringify(sendObj)
            this.send(sendJSON)
        }
    }
}
  start () {
    console.log('start')
    this.rec.start()
  }

  stop () {
    console.log('stop')
    this.rec.stop()
    this.rec.clear()
  }
  cleanMessage () {
    this.cleanMsg()
  }

  initWebsocketEvent () {
    this.websocket.onclose = () => {
      console.log('websocket断开')
    }
    this.websocket.onerror = () => {
      console.log('websocket错误')
    }
    this.websocket.onopen = () => {
      console.log('websocket链接')
    }
    this.websocket.onmessage = (event) => {
      console.log('WebSocket:收到一条消息', event.data)
      let result = JSON.parse(event.data)
      console.log(result)
      if (result.type !== 3 && result.type !== 4 && result.type !== 5 && result.type !== 7 && result.type !== 9) {
        // console.log(result.content)
        result.content=result.content.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\，|\？|\！|\；|\。]/g,"");
        // console.log(result.content)
        let wavContentData = {
          wav:result.wav,
          content:result.content
        }
        
        
        // console.log(this.logMessage)
        result.wavContent = [];
        result.wavs = [];
        result.shotShow = true;
        let dtats = {
          wav:result.wav,
        }
        result.wavs.push(dtats);
        
        if(this.logMessage.length > 0){
          if(result.name == this.logMessage[this.logMessage.length - 1].name){
            this.logMessage[this.logMessage.length - 1].content = this.logMessage[this.logMessage.length - 1].content + ' \n ' + result.content; 
            this.logMessage[this.logMessage.length - 1].wavs.push(dtats)
            this.logMessage[this.logMessage.length - 1].wavContent.push(wavContentData);
            console.log(this.logMessage)
          }else{
            result.wavContent.push(wavContentData);
            console.log(result)
            this.setMessage(result)
          }
        }else{
          result.wavContent.push(wavContentData);
          console.log(result)
          this.setMessage(result)
        }
      }
      if (result.type === 2) {
        // 更新证据目录
        this.getEviListApi(this.caseId)
      }
      if (result.type === 3) {
        this.openEvi(result.content)
      }
      if (result.type === 4) {
        this.openEviMore(result.content, 4)
      }
      if (result.type === 5) {
        this.openEviMore(result.content, 5)
      }
      if (result.type === 7) {
        this.getResultListApi()
        if (result.content !== '') {
          this.openResult(result.content)
        }
      }
      if (result.type === 9){
        this.openEviImg()
      } 
      let contentEl = this.$refs.content as HTMLElement
      this.$nextTick(() => {
        contentEl.scrollTop = contentEl.scrollHeight
      })
    }
  }
  showMore(data){
    if(data.shotShow){
      data.shotShow = false
    }else{
      data.shotShow = true
    }
    
  }
  openEviMore (result, type) {
    let filesAddr
    if (type === 4) {
      if (result > this.eviList.length) {
        swal({
          title: '提示',
          text: `找不到序号为:${result}的证据`,
          type: 'warning',
          confirmButtonText: '关闭'
        })
        return
      } else {
        filesAddr = this.eviList[result - 1].file
      }
    } else {
      for (let i = 0; i < this.eviList.length; i++) {
        if (this.eviList[i].name === result) {
          filesAddr = this.eviList[i].file
        }
      }
    }
    let that = this
    let index = 0
    let { fileAddr, fileName } = filesAddr[index]
    function checkImg (fileName) {
      let index = fileName.indexOf('.')
      fileName = fileName.substring(index)
      if (fileName !== '.bmp' && fileName !== '.png' && fileName !== '.gif' && fileName !== '.jpg' && fileName !== '.jpeg') {  // 根据后缀，判断是否符合图片格式
        return false
      } else {
        return true
      }
    }

    function checkPDF (fileName) {
      let index = fileName.indexOf('.')
      fileName = fileName.substring(index)
      if (fileName !== '.pdf') {
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
  openEviImg(){
    let that = this;
    //   console.log()
      //掉接口获取二维码路径
      createImg().then(res => {
        if (res.data.state === 100) {
          console.log(res)
          let QRCode=res.data.path
          this.$swal({
            title: '扫描二维码签名确认',
                html: "<img  src="+'/'+QRCode+" style='width:55%'>",
            // imageUrl: '/dist/images/tu-s.png',
            confirmButtonText: '好的',
            allowOutsideClick: false,
        })
        } else {
          this.$swal({
            type: 'error',
            title: res.data.message
          })
        }
      })

  }
  openEvi (fileAddr) {
    console.log(fileAddr.indexOf("http") != -1) //没有出现等于-1
    
    let arr = fileAddr.split('/')
    let filename = arr[arr.length - 1]
    function checkImg (filename) {
      let index = filename.indexOf('.')
      filename = filename.substring(index)
      if (filename !== '.bmp' && filename !== '.png' && filename !== '.gif' && filename !== '.jpg' && filename !== '.jpeg') {  // 根据后缀，判断是否符合图片格式
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
      let src = '';
      
      if(fileAddr.indexOf("http") != -1){
        src = fileAddr;
      }else{
        src = location.origin + fileAddr
      }
      
      swal({
        html: `<img src="${src}" width="700px" />`,
        width: '850px',
        confirmButtonText: '关闭'
      })
    } else if (checkPDF(filename)) {
      const src = fileAddr
      swal({
        html: `<iframe src="${src}" width="750" height="400" frameborder="0" style="object-fit: fill;"></iframe>`,
        width: '850px',
        confirmButtonText: '关闭'
      })
    } else {
      let src = '';
      if(fileAddr.indexOf("http") != -1){
        src = 'https://view.officeapps.live.com/op/view.aspx?src=' +  fileAddr
      }else{
        src = 'https://view.officeapps.live.com/op/view.aspx?src=' + location.origin + fileAddr
      }
      
      swal({
        html: `<iframe src="${src}" width="750" height="400" frameborder="0" style="object-fit: fill;"></iframe>`,
        width: '850px',
        confirmButtonText: '关闭'
      })
    }
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
  openWAV (path) {
    console.log(path)
    this.audio.src = path
    this.audio.play()
  }

  sendMessage () {
 
    let sendObj = { 'name': '', 'roleName': '', 'type': 1, 'wav': '', 'content': this.message, 'createDate': '' }
    let sendJSON = JSON.stringify(sendObj)
    this.send(sendJSON)
    this.message = ''
  }

  changeAIType (num) {
    this.AIType = num
    let sendObj = { 'name': '', 'roleName': '', 'type': 8, 'wav': '', 'content': this.AIType, 'createDate': '' }
    let sendJSON = JSON.stringify(sendObj)
    this.send(sendJSON)
  }

  destroyed () {
    if (this.recStatus) {
      if (this.userInfo.role === '法官') {
        piliRTC.stopMergeStream()
      }
      this.recStatus = false
      this.stop()
    }
  }
}
