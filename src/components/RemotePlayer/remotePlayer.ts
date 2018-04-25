import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { piliRTC } from '../../utils/pili'

@Component({
  template: require('./remotePlayer.html')
})
export class RemotePlayer extends Vue {
  name: 'RemotePlayer'

  @Prop()
  id: string

  @Watch('id', { immediate: true, deep: true })
  async autopPlay (val: string, oldVal: string) {
    if (this.id !== undefined) {
      const stream = await piliRTC.subscribe(this.id)
      stream.play(this.$refs.video, false)
    }
  }
}
