import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
import { HZRecorder } from '../../utils/recorder/index.js'
import { voice } from '../../api/case'
import { formatDate } from '../../utils/date'
import RWS from '../../utils/rws'
import Recorder from '../../utils/recorder/Recorder'

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
  @Getter('getMessage') logMessage: Array<any>
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Action('setMessage') setMessage: Function
  @Prop()
  show: boolean

  rec: any = {}
  timer: any
  recStatus: boolean = false
  websocket: any
  rws: any
  timeout: number = 30000
  timeoutObj: any = null
  serverTimeoutObj: any = null
  lockReconnect: boolean = false
  wsUrl: string = 'ws://localhost:8080/api/voice/ws.jhtml' // ws://localhost:8080/api/voice/ws.jhtml
  emptyCheckCount: number = 0
  emptydatacount: number = 0
  emptyData: boolean = true
  message: string = ''
  contentEl: any

  mounted () {
    let contentEl = this.$refs.content as any
    this.$nextTick(() => {
      contentEl.scrollTop = contentEl.scrollHeight
    })

    let that = this

    // 创建语音识别 webSocket
    this.createWebSocket(this.wsUrl)

    // 获取语音对象
    navigator.getUserMedia({ audio: true }, function (stream) {
      that.rec = new HZRecorder(stream, {}, that.websocket)

      // 监听语音输入 是否为空
      that.rec.recorder.onaudioprocess = function (e) {
        let data = e.inputBuffer.getChannelData(0)
        that.rec.audioData.input(data)
        let blob = that.rec.audioData.encodeWAV()
        that.rws.send(blob)
        let l = Math.floor(data.length / 10)
        let vol = 0
        for (let i = 0; i < l; i++) {
          vol += Math.abs(data[i * 10])
        }
        that.emptyCheckCount++
        if (vol < 30) {
          that.emptydatacount++
          if (that.emptydatacount > 20) {
            if (!that.emptyData) {
              console.log('stoped')
              // let blob = that.rec.audioData.encodeWAV()
              that.rec.audioData.buffer = []
              that.rec.audioData.size = 0
              // that.rws.send(blob)
              that.emptyData = true
            }
            return
          }
        } else {
          that.emptydatacount = 0
          that.emptyData = false
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
      let that = this
      // piliRTC.setDefaultMergeStream(1280, 720)
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

  createWebSocket (url) {
    try {
      this.rws = new RWS(this.wsUrl)
      this.initEventHandle()
    } catch (e) {
      this.reconnect(url)
    }
  }

  initEventHandle () {
    this.rws.onclose = () => {
      console.log('websocket断开')
      // this.reconnect(this.wsUrl)
    }
    this.rws.onerror = () => {
      console.log('websocket错误')
      // this.reconnect(this.wsUrl)
    }
    this.rws.onopen = () => {
      console.log('websocket链接')
      // this.resetHeart()
    }
    this.rws.onmessage = (event) => {
      console.log('WebSocket:收到一条消息', event.data)
      let result = JSON.parse(event.data)
      this.setMessage(result)
      let contentEl = this.$refs.content as any
      this.$nextTick(() => {
        contentEl.scrollTop = contentEl.scrollHeight
      })
      // this.resetHeart()
    }
  }

  reconnect (url) {
    if (this.lockReconnect) return
    this.lockReconnect = true
    setTimeout(() => {
      this.createWebSocket(url)
      this.lockReconnect = false
    }, 2000)
  }

  sendMessage () {
    this.rws.send(this.message)
    this.message = ''
  }

  destroyed () {
    this.recStatus = false
    this.stop()
    this.rws.close()
  }
}
