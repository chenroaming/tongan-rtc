import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
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
  name: 'RemotePlayer'

  @Prop()
  id: string

  userInfo: UserShape = {
    name: '',
    roleNmae: ''
  }

  @Watch('id', { immediate: true, deep: true })
  async autopPlay (val: string, oldVal: string) {
    if (this.id !== undefined) {
      const stream = await piliRTC.subscribe(this.id)
      stream.play(this.$refs.video)

      const res = await userDetail(this.id)
      if (res.data.state === 100) {
        this.userInfo = res.data.result
      }
    }
  }
}
