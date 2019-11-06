import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import clm from 'clmtrackr'
import { faceResult } from '../../api/user'
import './faceCheck.less'

@Component({
  template: require('./faceCheck.html')
})
export class FaceCheck extends Vue {
  @Action('logout') logout: Function
  @Getter('getFaceCheckState') hasFaceSuccess: boolean
  @Getter('getLoginState') hasLogin: boolean
  @Action('getUserInfo') getUserInfo: Function
  name: 'FaceCheck'

  ctracker: any = new clm.tracker({ useWebGL: true })
  failTimes: number = 0

  mounted () {
    const video = document.getElementById('video') as HTMLVideoElement
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: false, video: { width: 1280, height: 720 } },
        function (stream) {
          video.srcObject = stream
          video.onloadedmetadata = function (e) {
            video.play()
          }
        },
        function (error) {
          console.log(error)
        }
      )
    } else {
      console.log('getUserMedia not supported')
    }
    // this.getUserInfo().then(res => {
    //   if (res.data.state === 100) {
    //     this.startTrack()
    //   }
    // })
  }

  stopTrack () {
    console.log('stop')
    this.ctracker.stop()
    this.ctracker.reset()
  }
  startTrack () {
    console.log('begin')
    this.$store.commit('SET_FACECHECK', false)
    const vleft = 0
    const vtop = 0
    const video = document.getElementById('video') as HTMLVideoElement
    const canvasInput = document.getElementById('canvas') as HTMLCanvasElement
    const catchCanvas = document.getElementById('catchCanvas') as HTMLCanvasElement
    const context = catchCanvas.getContext('2d')
    const cc = canvasInput.getContext('2d')
    this.ctracker.init()
    this.ctracker.start(video)
    let last = +new Date()
    // 定时器
    const threshhold = 2000
    const that = this
    that.failTimes = 0
    function drawLoop () {
      cc.clearRect(vleft, vtop, canvasInput.width, canvasInput.height)
      let positions = that.ctracker.getCurrentPosition()
      if (positions) {
        that.ctracker.draw(canvasInput)
        // console.log('catch')
        let now = +new Date()
        if (last && now > last + threshhold) {
          last = now
          getImage(that)
        }
      }
      requestAnimationFrame(drawLoop)
    }

    function getImage (that) {
      context.drawImage(video, vleft, vtop, catchCanvas.width, catchCanvas.height)
      let imgURL = catchCanvas.toDataURL('image/jpeg')
      faceResult(imgURL).then(res => {
        if (res.data.state === 100) {
          let data = JSON.parse(res.data.result)
          console.log(data)
          if (that.hasFaceSuccess || that.failTimes > 5) {
            if (that.failTimes > 5) {
              that.$swal({
                type: 'error',
                title: '人脸验证失败！'
              })
              that.ctracker.stop()
              that.ctracker.reset()
              that.stopTrack()
            }
            return
          } else {
            if (data.confidence) {
              if (data.confidence > 75) {
                that.$swal({
                  type: 'success',
                  title: '验证成功！'
                })
                that.$store.commit('SET_FACECHECK', true)
                that.ctracker.stop()
                that.ctracker.reset()
                that.stopTrack()
              } else {
                that.failTimes++
              }
            }
          }
        } else {
          that.$swal({
            type: 'error',
            title: res.data.message
          })
        }
      })
    }
    drawLoop()
  }
}
