import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'

import './localPlayer.less'

@Component({
  template: require('./localPlayer.html')
})
export class LocalPlayer extends Vue {
  name: 'LocalPlayer'

  @Prop()
  stream: any

  @Watch('stream', { immediate: true, deep: true })
  autoPlay (val: string, oldVal: string) {
    if (this.stream.userId !== undefined) {
      this.stream.play(this.$refs.video, true)
    }
  }
}
