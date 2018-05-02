import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { LocalPlayer } from '../../components/LocalPlayer'
import { RemotePlayer } from '../../components/RemotePlayer'
import { piliRTC } from '../../utils/pili'
import { Stream, User, deviceManager } from 'pili-rtc-web'
import './roomPage.less'

@Component({
  template: require('./roomPage.html'),
  components: {
    LocalPlayer,
    RemotePlayer
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
    this.users = piliRTC.subscribedUsers
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
  }

  async outRoom () {
    piliRTC.unpublish().then(() => {
      piliRTC.leaveRoom()
      this.$router.push({
        name: 'loginPage'
      })
    }).catch(console.error)
  }
}
