import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
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
  @Action('setVideoSrcObj') setVideoSrcObj: Function
  @Action('setMainInfo') setMainInfo: Function
  @Action('websocketSend') send: Function

  name: string = ''
  roleName: string = ''
  isfull: boolean = false
  // rws: any = ''
  // wsUrl: string = 'ws://localhost:8080/api/voice/ws.jhtml'

  @Prop()
  stream: any

  @Watch('stream', { immediate: true, deep: true })
  autoPlay (val: string, oldVal: string) {
    if (this.stream.userId !== undefined) {
      const localVideo = this.$refs.video as HTMLVideoElement
      this.stream.play(localVideo, true)
      this.setVideoSrcObj(localVideo.srcObject)
      // this.stream.onAudioBuffer(buffer => {
      //   this.send(buffer)
      // }, 2048)
    }
  }
  mounted () {
    // this.rws = new RWS(this.wsUrl)
    userDetail(this.userInfo.id).then(res => {
      if (res.data.state === 100) {
        this.name = res.data.result.name
        this.roleName = res.data.result.roleName
        this.setMainInfo({ name: this.name, roleName: this.roleName })
      }
    })
  }

  openFull () {
    const localVideo = this.$refs.video as HTMLVideoElement
    this.setVideoSrcObj(localVideo.srcObject)
    this.setMainInfo({ name: this.name, roleName: this.roleName })
  }
}
