import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
import { HZRecorder } from '../../utils/recorder/index.js'
import { voice } from '../../api/case'

import './localPlayer.less'

@Component({
  template: require('./localPlayer.html')
})
export class LocalPlayer extends Vue {
  name: 'LocalPlayer'
  @Action('setMessage') setMessage: Function

  FFTS: number = 512
  MAX_SECOND: number = 60

  @Prop()
  stream: any
  rec: any = {}
  timer: any
  recStatus: boolean = false
  websocket: any
  timeout: number = 6000
  timeoutObj: any = null
  serverTimeoutObj: any = null
  lockReconnect: boolean = false
  wsUrl: string = 'ws://localhost:8080/api/voice/ws.jhtml'
  emptyCheckCount: number = 0
  emptydatacount: number = 0
  emptyData: boolean = true

  @Watch('stream', { immediate: true, deep: true })
  autoPlay (val: string, oldVal: string) {
    if (this.stream.userId !== undefined) {
      this.stream.play(this.$refs.video, true)
    }
  }

  created () {
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
        let l = Math.floor(data.length / 10)
        let vol = 0
        for (let i = 0; i < l; i++) {
          vol += Math.abs(data[i * 10])
        }
        that.emptyCheckCount++
        if (vol < 30) {
          that.emptydatacount++
          if (that.emptydatacount > 30) {
            if (!that.emptyData) {
              console.log('stoped')
              let blob = that.rec.audioData.encodeWAV()
              that.rec.audioData.buffer = []
              that.rec.audioData.size = 0
              that.websocket.send(blob)
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
  destroyed () {
    this.websocket.close()
    clearInterval(this.timer)
    if (this.recStatus) {
      this.stop()
    }
  }

  handleTrigger (e) {
    if (this.recStatus) {
      this.recStatus = false
      this.stop()
    } else {
      this.start()
      let that = this
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

  resetHeart () {
    clearTimeout(this.timeoutObj)
    clearTimeout(this.serverTimeoutObj)
    this.startHeart()
  }

  startHeart () {
    let self = this
    this.timeoutObj = setTimeout(() => {
      self.websocket.send('')
      self.serverTimeoutObj = setTimeout(() => {
        self.websocket.close()
      }, self.timeout)
    }, self.timeout)
  }

  reconnect (url) {
    if (this.lockReconnect) return
    this.lockReconnect = true
    setTimeout(() => {
      this.createWebSocket(url)
      this.lockReconnect = false
    }, 2000)
  }

  createWebSocket (url) {
    try {
      this.websocket = new WebSocket(url)
      this.initEventHandle()
    } catch (e) {
      this.reconnect(url)
    }
  }

  initEventHandle () {
    this.websocket.onclose = () => {
      this.reconnect(this.wsUrl)
    }
    this.websocket.onerror = () => {
      this.reconnect(this.wsUrl)
    }
    this.websocket.onopen = () => {
      this.resetHeart()
    }
    this.websocket.onmessage = (event) => {
      console.log('WebSocket:收到一条消息', event.data)
      let result = JSON.parse(event.data)
      console.log(result)
      if (result.err_no !== 3301) {
        this.setMessage(result)
      }
      this.resetHeart()
    }
  }
}
