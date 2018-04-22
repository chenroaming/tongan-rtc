import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'

import './loginPage.less'
import { PassThrough } from 'stream'

interface LoginFormShape {
  username: string
  password: string
  code: string
}

@Component({
  template: require('./loginPage.html'),
  components: {
    VueParticles
  }
})

export class LoginPage extends Vue {
  @Action('login') login: Function
  // 用户类型 judge or litigant
  userType: string = 'judge'
  // 验证码
  codeSrc: string = '/api/main/code.jhtml'
  // 用户表单参数
  loginForm: LoginFormShape = {
    username: '',
    password: '',
    code: ''
  }

  changeCode () {
    this.codeSrc = '/api/main/code.jhtml?tm=' + Math.random()
  }

  handleLogin () {
    this.login(this.loginForm).then(res => {
      if (res.data.state === 100) {
        // this.$router.push({
        //   name: 'roomPage'
        // })
      }
    })
  }
}
