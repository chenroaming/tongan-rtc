import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { LocalPlayer } from '../../components/LocalPlayer'
import { RemotePlayer } from '../../components/RemotePlayer'
import { ChatWindow } from '../../components/ChatWindow'
import { EvidenceWindow } from '../../components/EvidenceWindow'
import { piliRTC } from '../../utils/pili'
import { Stream, User, deviceManager } from 'pili-rtc-web'
import VueUploadComponent from 'vue-upload-component'
import { userDetail } from '../../api/user'
import './roomPage.less'

@Component({
  template: require('./roomPage.html'),
  components: {
    LocalPlayer,
    RemotePlayer,
    ChatWindow,
    EvidenceWindow,
    FileUpload: VueUploadComponent
  }
})

export class RoomPage extends Vue {
  @Getter('getRoomToken') roomToken: string
  @Mutation('SET_USERID') setUserId: Function
  @Getter('getUserId') userId: string
  @Getter('getMessage') logMessage: Array<any>

  localStream: any = new Stream()
  users: Array<any> = []
  evidenceShow: boolean = false
  logShow: boolean = false
  files: Array<any> = []
  message: string = ''
  week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  clock = {
    date: '',
    time: '',
    week: ''
  }
  timer: any

  created () {
    let that = this
    this.timer = setInterval(function () {
      that.updateTime()
    }, 1000)
  }

  async mounted () {

    console.log(this.users)
    piliRTC.on('user-join', user => {
      console.log('user-join')
      console.log(user)
    })
    piliRTC.on('user-publish', user => {
      console.log('user-publish')
      console.log(user)
      this.users.push(user)
    })
    piliRTC.on('user-unpublish', user => {
      console.log('user-unpublish')
      console.log(user)
      this.users.map((item, index) => {
        if (item.userId === user.userId) {
          this.users.splice(index, 1)
        }
      })
      console.log(this.users)
    })

    try {
      this.localStream = await deviceManager.getLocalStream({
        audio: {
          enabled: true
        },
        video: {
          enabled: true,
          bitrate: 1200,
          width: 1280,
          height: 720
        }
      })
    } catch (e) {
      switch (e.name) {
        case 'NotAllowedError':
          console.log('获取摄像头权限被拒绝，请手动打开摄像头权限后重新进入页面')
          break
        case 'TypeError':
          break
        default:
          console.log(`无法获取摄像头数据，错误代码${e.name}`)
      }
    }
    // 进入房间
    try {
      console.log('joinRoomWithToken')
      const roomInfo = await piliRTC.joinRoomWithToken(this.roomToken)
      console.log(roomInfo)
    } catch (e) {
      console.log('加入房间失败!', e)
    }

    // 本地推流
    try {
      console.log('publish')
      const publishInfo = await piliRTC.publish(this.localStream)
      console.log(publishInfo)
      this.setUserId(publishInfo.userId)
    } catch (e) {
      console.log('本地推流失败!', e)
    }
    this.users = piliRTC.users
    this.users.map((item, index) => {
      if (!item.published) {
        this.users.splice(index, 1)
      }
    })
    console.log(this.users)
  }

  destroyed () {
    piliRTC.unpublish().then(res => {
      console.log('destroyed')
      console.log(res)
      piliRTC.leaveRoom()
    }).catch(err => {
      console.log(err)
    })
    clearInterval(this.timer)
  }

  async outRoom () {
    piliRTC.unpublish().then(() => {
      piliRTC.leaveRoom()
      this.$router.push({
        name: 'loginPage'
      })
    }).catch(console.error)
  }

  updateTime () {
    let cd = new Date()
    this.clock.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
    this.clock.date = this.zeroPadding(cd.getFullYear(), 4) + '年' + this.zeroPadding(cd.getMonth() + 1, 2) + '月' + this.zeroPadding(cd.getDate(), 2) + '日'
    this.clock.week = this.week[cd.getDay()]
  }
  zeroPadding (num, digit) {
    let zero = ''
    for (let i = 0; i < digit; i++) {
      zero += '0'
    }
    return (zero + num).slice(-digit)
  }
}
