import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { getWorkers } from '../../api/worker'

import './workerWindow.less'

interface UserShape {
  name: string,
  imagePath: string
}

@Component({
  template: require('./workerWindow.html')
})
export class WorkerWindow extends Vue {
  name: 'WorkerWindow'
  @Getter('getCaseId') caseId: number

  judge: UserShape = {
    name: '',
    imagePath: ''
  }
  clerk: UserShape = {
    name: '',
    imagePath: ''
  }
  assistant: UserShape = {
    name: '',
    imagePath: ''
  }

  mounted () {
    getWorkers(this.caseId).then(res => {
      console.log(res)
      this.judge = res.data.judge
      this.assistant = res.data.assistant
      this.clerk = res.data.clerk
    })
  }
}
