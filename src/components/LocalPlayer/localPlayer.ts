import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
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
  context: any = {}
  dataArray: any = new Uint8Array(this.FFTS)
  sumDataArray: number = 0
  audioes: Array<any> = []
  drawVisual: number = 0
  timer: any
  recordSec: number = 0
  recStatus: boolean = false
  websocket: any

  @Watch('stream', { immediate: true, deep: true })
  autoPlay (val: string, oldVal: string) {
    if (this.stream.enableVideo) {
      this.stream.play(this.$refs.video, true)
    }
  }

  created () {
    let that = this
    this.websocket = new WebSocket('ws://192.168.86.117:8080/voice/ws.jhtml')
    this.websocket.onopen = function (event) {
      console.log('WebSocket：已连接')
    }
    this.websocket.onmessage = function (event) {
      console.log('WebSocket:收到一条消息', event.data)
      let result = JSON.parse(event.data)
      console.log(result)
      if (result.err_no !== 3301) {
        that.setMessage(result)
      }
    }

    this.websocket.onerror = function (event) {
      console.log('WebSocket: 发生错误')
    }

    this.websocket.onclose = function (event) {
      console.log('WebSocket: 断开链接')
    }

    // setInterval(function () {
    //   that.websocket.send('')
    // }, 5000)

    navigator.getUserMedia({ audio: true }, function (stream) {
      that.rec = new HZRecorder(stream, {}, that.websocket)
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
      clearInterval(this.timer)
    } else {
      this.start()
      let that = this
      // this.timer = setInterval(function () {
      //   that.stop()
      // }, 10000)
    }
  }
  start () {
    this.recStatus = true
    const startTime = Date.now()
    console.log('start')
    this.rec.start()
  }

  stop () {
    console.log('stop')
    this.recordSec = 0
    let blob = this.rec.getBlob()
    this.rec.clear()
    this.rec.start()
    this.websocket.send(blob)
    // voice(blob).then(res => { console.log(res) })
    console.log('stop recording')
  }
}
