import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'

import './loginPage.less'

@Component({
  template: require('./loginPage.html'),
  components: {
    VueParticles
  }
})

export class LoginPage extends Vue {

  @Getter('getUserName') name: string
  @Action('login') login: Function

  userType: string = 'judge'
  hasLogin: boolean = false

  created () {
    this.$swal({
      title: '提示',
      text: 'hello world',
      showCancelButton: true,
      confirmButtonTex: '提交',
      cancelButtonText: '取消'
    })
    console.log(this.name)
    this.login({ username: 'admin', password: '123456' })
  }
  submitLogin () {
    this.hasLogin = true
  }
  backLogin () {
    this.hasLogin = false
  }
}
