import { Component, Vue } from 'vue-property-decorator'

@Component({
  template: require('./localPlayer.html')
})
export class LocalPlayer extends Vue {
  name: 'LocalPlayer'
}
