import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  template: require('./localPlayer.html')
})
export class LocalPlayer extends Vue {
  name: 'LocalPlayer'
  @Prop()
  stream: any

  @Watch('stream', { immediate: true, deep: true })
  autopPlay (val: string, oldVal: string) {
    if (this.stream.userId !== undefined) {
      this.stream.play(this.$refs.video, false)
    }
  }
}
