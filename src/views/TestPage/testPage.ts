import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'
import Recorder from '../../utils/recorder/Recorder'
import RWS from '../../utils/rws'
import './testPage.less'

const FFTS = 512
const MAX_SECOND = 10

@Component({
  template: require('./testPage.html')
})

export class TestPage extends Vue {
  rec: any
  context: any
  dataArray = new Uint8Array(FFTS)
  sumDataArray: any
  audioes = []
  drawVisual = 0
  timer = 0
  recordSec = 0
  recStatus = false
  wsUrl: string = 'ws://localhost:8080/api/voice/ws.jhtml'
  rws: any

  created () {
    this.rws = new RWS(this.wsUrl)
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
    }
    // this.start()
  }
  start () {
    this.recStatus = true
    const startTime = Date.now()
    const handleSuccess = (stream) => {

      // new AudioContext
      this.context = new AudioContext()

      let source = this.context.createMediaStreamSource(stream)
      let analyser = this.context.createAnalyser()

      source.connect(analyser)
      // new Recorder ('/lib/Recorder.js')
      this.rec = new Recorder(source)
      this.rec.record()

      analyser.fftSize = FFTS
      // frequencyBinCount = fftSize / 2
      const bufferLength = analyser.frequencyBinCount

      this.dataArray = new Uint8Array(bufferLength)

      let draw = () => {

        this.drawVisual = window.requestAnimationFrame(draw)
        analyser.getByteFrequencyData(this.dataArray)

        this.sumDataArray = (this.dataArray.slice(50, 500).reduce((p, c) => p + c, 0) / 225 * 1.1 + 72).toFixed(2)
        // console.log(this.dataArray)
      }
      draw()

      let recTimer = () => {
        this.timer = window.requestAnimationFrame(recTimer)
        this.recordSec = ~~((Date.now() - startTime) / 1000)
      }
      recTimer()
    }

    const handleError = (error) => {
      console.log(error)
    }

    const navigator = window.navigator

    let mediaDevices = navigator.mediaDevices
    let getUserMedia = (mediaDevices.getUserMedia).bind(mediaDevices) ||
      (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia).bind(navigator)

    getUserMedia({ audio: true, video: false })
      .then(handleSuccess)
      .catch(handleError)
  }
  stop () {
    this.recStatus = false
    this.recordSec = 0
    window.cancelAnimationFrame(this.timer)
    window.cancelAnimationFrame(this.drawVisual)

    this.context.close()
      .then(() => {
        this.rec.stop()
        this._createDownloadLink()
        this.rec.clear()

        /**
         * reset display
         */
        this.sumDataArray = 0
        this.dataArray = new Uint8Array(FFTS / 2)

        console.log('stop recording')
      })

  }
  handleTrigger (e) {
    if (this.recStatus) {
      this.stop()
    } else {
      this.start()
    }
  }
  _createDownloadLink () {
    this.rec.exportWAV((blob) => {
      this.rws.send(blob)
    })
  }
}
