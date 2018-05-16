import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { MainPlayer } from '../../components/MainPlayer'
import { LocalPlayer } from '../../components/LocalPlayer'
import { RemotePlayer } from '../../components/RemotePlayer'
import { ChatWindow } from '../../components/ChatWindow'
import { EvidenceWindow } from '../../components/EvidenceWindow'
import { piliRTC } from '../../utils/pili'
import { Stream, User, deviceManager } from 'pili-rtc-web'
import { userDetail } from '../../api/user'
import './roomPage.less'

@Component({
  template: require('./roomPage.html'),
  components: {
    MainPlayer,
    LocalPlayer,
    RemotePlayer,
    ChatWindow,
    EvidenceWindow
  }
})

export class RoomPage extends Vue {
  @Getter('getRoomToken') roomToken: string
  @Mutation('SET_USERID') setUserId: Function
  @Getter('getUserId') userId: string
  @Getter('getMessage') logMessage: Array<any>
  @Getter('getCaseNo') caseNo: string
  @Getter('getCaseId') caseId: number

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
    this.$swal({
      title: '庭审须知',
      text: '庭审保持安静，不得随意站立、走动，不得让无关人员进入视频，不得采取过激语言等；若破坏法庭铁序、妨害诉讼活动顺利进行的，依法追究法律责任',
      imageUrl: 'http://court.ptnetwork001.com/dist/images/tu-s.png',
      confirmButtonText: '明白',
      allowOutsideClick: false
    })
    let that = this
    this.timer = setInterval(function () {
      that.updateTime()
    }, 1000)
    piliRTC.on('user-join', user => {
      console.log('user-join')
      console.log(this.users)
      this.users.map((item, index) => {
        if (!item.published) {
          this.users.splice(index, 1)
        }
      })
    })
    piliRTC.on('user-publish', user => {
      console.log('user-publish')
      console.log(user)
      this.users.push(user)
      console.log(this.users)
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
  }

  async mounted () {
    try {
      this.localStream = await deviceManager.getLocalStream({
        audio: {
          enabled: true
        },
        video: {
          enabled: true,
          bitrate: 720,
          frameRate: 30,
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
    piliRTC.leaveRoom()
    clearInterval(this.timer)
    piliRTC.removeAllListeners('user-join')
    piliRTC.removeAllListeners('user-publish')
    piliRTC.removeAllListeners('user-unpublish')
  }

  async outRoom () {
    this.$router.push({
      name: 'loginPage'
    })
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
