import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { Stream, User, deviceManager } from 'pili-rtc-web'
import { piliRTC } from '../../utils/pili'
import { userDetail } from '../../api/user'
import RWS from '../../utils/rws'
import './localPlayer.less'

interface UserInfoShape {
  id: number,
  name: string,
  role: string
}

@Component({
  template: require('./localPlayer.html')
})
export class LocalPlayer extends Vue {
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Mutation('SET_USERID') setUserId: Function
  @Action('setVideoSrcObj') setVideoSrcObj: Function
  @Action('setMainInfo') setMainInfo: Function
  @Action('websocketSend') send: Function
  @Getter('getRoomToken') roomToken: string

  name: string = ''
  roleName: string = ''
  isfull: boolean = false
  // rws: any = ''
  // wsUrl: string = 'ws://localhost:8080/api/voice/ws.jhtml'

  // @Prop()
  // stream: any

  // @Watch('stream', { immediate: true, deep: true })
  // autoPlay (val: string, oldVal: string) {
  //   if (this.stream.userId !== undefined) {
  //     const containerElement = this.$refs.videoWrapper as HTMLElement
  //     this.stream.play(containerElement, true)
  //     const localVideo = containerElement.children[1] as HTMLVideoElement
  //     this.setVideoSrcObj(localVideo.srcObject)
  //   }
  // }
  async mounted () {
    // this.rws = new RWS(this.wsUrl)
    userDetail(this.userInfo.id).then(res => {
      if (res.data.state === 100) {
        this.name = res.data.result.name
        this.roleName = res.data.result.roleName
        this.setMainInfo({ name: this.name, roleName: this.roleName })
      }
    })

    try {
      const localStream = await deviceManager.getLocalStream({
        audio: {
          enabled: true
        },
        video: {
          enabled: true,
          bitrate: 720,
          frameRate: 30,
          width: 1280,
          height: 720
        }
      })
      const containerElement = this.$refs.videoWrapper as HTMLElement
      await localStream.play(containerElement, true)
      const localVideo = containerElement.children[1] as HTMLVideoElement
      // console.log(localVideo.srcObject)
      this.setVideoSrcObj(localVideo.srcObject)
    } catch (e) {
      switch (e.name) {
        case 'NotAllowedError':
          console.log('获取摄像头权限被拒绝，请手动打开摄像头权限后重新进入页面')
          break
        case 'TypeError':
          break
        default:
          console.log(`无法获取摄像头数据，错误代码${e.name}`)
      }
    }
  }

  openFull () {
    const containerElement = this.$refs.videoWrapper as HTMLElement
    const localVideo = containerElement.children[1] as HTMLVideoElement
    this.setVideoSrcObj(localVideo.srcObject)
    this.setMainInfo({ name: this.name, roleName: this.roleName })
  }

  destroyed () {
    this.setVideoSrcObj(new MediaStream())
  }
}
