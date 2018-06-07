import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
import { userDetail } from '../../api/user'

import './remotePlayer.less'

interface UserShape {
  name: string
  roleNmae: string
}

@Component({
  template: require('./remotePlayer.html')
})
export class RemotePlayer extends Vue {
  @Action('setVideoSrcObj') setVideoSrcObj: Function
  @Action('setMainInfo') setMainInfo: Function
  name: 'RemotePlayer'

  @Prop()
  id: string

  userInfo: UserShape = {
    name: '',
    roleNmae: ''
  }
  isfull: boolean = false

  @Watch('id', { immediate: true, deep: true })
  async autopPlay (val: string, oldVal: string) {
    if (this.id !== undefined) {
      const stream = await piliRTC.subscribe(this.id)
      const containerElement = this.$refs.videoWrapper as HTMLElement
      stream.play(containerElement)

      const res = await userDetail(this.id)
      if (res.data.state === 100) {
        this.userInfo = res.data.result
      }
    }
  }

  openFull () {
    const containerElement = this.$refs.videoWrapper as HTMLElement
    const localVideo = containerElement.children[1] as HTMLVideoElement
    this.setVideoSrcObj(localVideo.srcObject)
    this.setMainInfo(this.userInfo)
  }
}
