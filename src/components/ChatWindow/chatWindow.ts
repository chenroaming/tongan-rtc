import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
import { HZRecorder } from '../../utils/recorder'
import { voice } from '../../api/case'
import { formatDate } from '../../utils/date'
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
  @Action('cleanMessage') cleanMsg: Function
  show: boolean = false
  rec: any = {}
  recStatus: boolean = false
  timeout: number = 30000
  lockReconnect: boolean = false
  emptyCheckCount: number = 0
  emptydatacount: number = 0
  emptyData: boolean = true
  message: string = ''
  audio: HTMLAudioElement = new Audio()

  mounted () {
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
      that.rec = new HZRecorder(stream, {})
      // 监听语音输入 是否为空
      that.rec.recorder.onaudioprocess = function (e) {
        let data = e.inputBuffer.getChannelData(0)
        that.rec.audioData.input(data)
        if (!that.emptyData) {
          console.log('vol')
        }
        let l = Math.floor(data.length / 10)
        let vol = 0
        for (let i = 0; i < l; i++) {
          vol += Math.abs(data[i * 10])
        }
        that.emptyCheckCount++
        if (vol < 20) {
          that.emptydatacount++
          if (that.emptydatacount > 20) {
            if (!that.emptyData) {
              console.log('stoped')
              let blob = that.rec.audioData.encodeWAV()
              that.send(blob)
              console.log(blob)
              that.emptyData = true
            } else {
              that.rec.audioData.buffer = []
              that.rec.audioData.size = 0
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
      this.stop()
    } else {
      this.start()
      if (this.userInfo.role === 'judge') {
        piliRTC.setDefaultMergeStream(1280, 720)
      }
    }
  }
  start () {
    this.recStatus = true
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
      if (result.type !== 3) {
        this.setMessage(result)
      }
      console.log(result.type)
      if (result.type === 2) {
        // 更新证据目录
        this.getEviListApi(this.caseId)
      }
      if (result.type === 3) {
        this.openEvi(result.content)
      }
      let contentEl = this.$refs.content as HTMLElement
      this.$nextTick(() => {
        contentEl.scrollTop = contentEl.scrollHeight
      })
    }
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

    if (checkImg(filename)) {
      const src = 'https://court1.ptnetwork001.com' + fileAddr
      swal({
        html: `<img src="${src}" width="600px" />`,
        width: '750px',
        confirmButtonText: '关闭'
      })
    } else {
      const src = 'https://view.officeapps.live.com/op/view.aspx?src=https://court1.ptnetwork001.com' + fileAddr
      swal({
        html: `<iframe src="${src}" width="650" height="400" frameborder="0" style="object-fit: fill;"></iframe>`,
        width: '750px',
        confirmButtonText: '关闭'
      })
    }
  }

  openWAV (path) {
    this.audio.src = 'https://court1.ptnetwork001.com' + path
    this.audio.play()
  }

  sendMessage () {
    let sendObj = { 'name': '', 'roleName': '', 'type': 1, 'wav': '', 'content': this.message, 'createDate': '' }
    let sendJSON = JSON.stringify(sendObj)
    this.send(sendJSON)
    this.message = ''
  }

  destroyed () {
    this.recStatus = false
    this.stop()
  }
}
