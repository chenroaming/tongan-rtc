import { Component, Vue } from 'vue-property-decorator'
import { LocalPlayer } from '../../components/LocalPlayer'
import { piliRTC } from '../../utils/pili'

import './roomPage.less'

@Component({
  template: require('./roomPage.html'),
  components: {
    LocalPlayer
  }
})

export class RoomPage extends Vue {
  stream: MediaStream
  localPlayer: Vue
  roomInfo: object
  publishInfo: object

  async mounted () {
    try {
      const timeout: Promise<MediaStream> = new Promise((resolve, reject) => {
        const err = new Error()
        err.name = 'TimeoutError'
        setTimeout(() => reject(err), 5000)
      })

      this.stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        }),
        timeout
      ])

      this.localPlayer = this.$refs.localplayer as Vue
      (this.localPlayer.$refs.video as HTMLVideoElement).srcObject = this.stream
    } catch (e) {
      switch (e.name) {
        case 'NotAllowedError':
          console.log('获取摄像头权限被拒绝，请手动打开摄像头权限后重新进入页面')
          break
        case 'TimeoutError':
          console.log('获取权限超时，您可能没有点击权限申请框，打开权限后重新进入页面')
          break
        case 'TypeError':
          break
        default:
          console.log(`无法获取摄像头数据，错误代码${e.name}`)
      }
    }

    // 进入房间
    try {
      this.roomInfo = await piliRTC.joinRoomWithToken('hvfoFSl-iuE5A9-XrU7fHe-Q3RfGCNPK529oGxd-:lpW3euIunp3BASGefIdZENz_rNc=:eyJhcHBJZCI6ImRlZmd0MXVtNSIsInBlcm1pc3Npb24iOiJhZG1pbiIsImV4cGlyZUF0IjoxNTIzNjM1MjAwLCJ1c2VySWQiOiIxNTg4MDIwMDcyMCIsInJvb21OYW1lIjoicHRuZXR3b3JrIn0=')
      console.log(this.roomInfo)
    } catch (e) {
      console.log('加入房间失败!', e)
    }

    // 本地推流
    try {
      this.publishInfo = await piliRTC.publish(this.stream)
      console.log(this.publishInfo)
    } catch (e) {
      console.log('本地推流失败!', e)
    }
  }
}
