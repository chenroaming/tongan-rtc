<template>
  <div class="recorder">
      <div class="timestamp">{{formatSec}}</div>
      <div class="frequency" :style="{ height: sumDataArray + 'px', width: sumDataArray + 'px' }"></div>
      <a class="_3z58" v-if="recStatus" @click.prevent="stop" role="button" title="取消" href="#">取消</a>
      <a href="#" @click.prevent="handleTrigger">
        <div class="recorder-btn" :class="{'active': recStatus}">
          <span class="btn-title" :class="{'active': recStatus}">{{recStatus ? '' : '錄音'}}</span>
        </div>
      </a>
  </div>
</template>

<script>
import { Recorder } from '../lib/index'

const FFTS = 512
const MAX_SECOND = 10

export default {
  data() {
    return {
      rec: {},
      context: {},
      dataArray: new Uint8Array(FFTS),
      sumDataArray: 0,
      audioes: [],
      drawVisual: 0,
      timer: 0,
      recordSec: 0,
      recStatus: false
    }
  },
  computed: {
    _secMin() {
      return ~~(this.recordSec / 60)
    },
    _secSec() {
      return (this.recordSec % 60).toString().padStart(2, '0')
    },
    formatSec() {
      return `${this._secMin}:${this._secSec}`
    }
  },
  watch: {
    recordSec(newSec) {
      // monit recording sec
      if (newSec > MAX_SECOND) this.stop()
    }
  },
  methods: {
    start(e) {
      this.recStatus = true
      const startTime = Date.now()
      const handleSuccess = (stream) => {

        // new AudioContext
        this.context = new (window.AudioContext || window.webkitAudioContext)()

        let source = this.context.createMediaStreamSource(stream),
            analyser = this.context.createAnalyser()

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
    },
    stop(e) {
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

    },
    handleTrigger(e) {
      if (this.recStatus) {
        this.stop()
      } else {
        this.start()
      }
    },
    _createDownloadLink() {
      this.rec.exportWAV((blob) => {
        this.$emit('exportBlob', blob)
        // const url = URL.createObjectURL(blob)
        // this.audioes.push({
        //   url,
        //   name: `${new Date().toISOString()}.wav`
        // })
      })
    }
  }
}
</script>

<style scoped>
/* #recordingslist {
  display: flex;
  flex-direction: column;
} */

.timestamp {
  color: rgba(0, 0, 0, .20);
  position: absolute;
  text-align: center;
  top: 16px;
  transition: color .1s;
  width: 100%;
}

.recorder {
  position: fixed;
  right: 10px;
  top: 10px;
  font-size: 15px;
  height: 178px;
  overflow: hidden;
  width: 220px;

  border: 0;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .1), 0 1px 10px rgba(0, 0, 0, .35);
}

a {
  color: #365899;
  cursor: pointer;
  text-decoration: none;
}

.recorder-btn {
  background-color: #f03d25;
  border-radius: 72px;
  color: #fff;
  height: 72px;
  transition: width .1s, height .1s;
  width: 72px;
}

.recorder-btn.active {
  height: 54px;
  width: 54px;
}

.recorder-btn, .frequency {
    left: 50%;
    position: absolute;
    text-align: center;
    top: 50%;
    transform: translate(-50%, -50%);
}

.btn-title {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.btn-title.active {
  background-color: #fff;
  height: 14px;
  width: 14px;
}

.frequency {
  background-color: #333;
  border-radius: 50%;
  opacity: .2;
}

._3z58 {
  color: #0084ff;
  position: absolute;
  right: 16px;
  text-align: center;
  top: 16px;
}

._3z58:hover {
  text-decoration: underline;  
}

</style>
