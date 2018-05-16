import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
import { userDetail } from '../../api/user'

import './mainPlayer.less'

@Component({
  template: require('./mainPlayer.html')
})
export class MainPlayer extends Vue {
  @Getter('getVideoSrcObj') videoSrcObj: MediaStream

  @Watch('videoSrcObj', { immediate: true, deep: true })
  autoPlay (val: MediaStream, oldVal: MediaStream) {
    const localVideo = this.$refs.video as HTMLVideoElement
    if (val.active) {
      this.$nextTick(() => {
        localVideo.srcObject = this.videoSrcObj
      })
    }
  }
}
