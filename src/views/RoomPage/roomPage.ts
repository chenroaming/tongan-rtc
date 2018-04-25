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

  localStream: any = new Stream()
  localPlayer: Vue
  remotePlayer: Vue
  users: Array<any> = [{
    userId: '',
    published: false
  }]

  async mounted () {
    piliRTC.on('user-join', user => {
      console.log(user)
    })
    piliRTC.on('user-publish', user => {
      console.log(user)
      this.users.push(user)
    })
    piliRTC.on('user-unpublish', user => {
      console.log(user)
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
      const roomInfo = await piliRTC.joinRoomWithToken(this.roomToken)
    } catch (e) {
      console.log('加入房间失败!', e)
    }

    // 本地推流
    try {
      const publishInfo = await piliRTC.publish(this.localStream)
      this.setUserId(publishInfo.userId)
    } catch (e) {
      console.log('本地推流失败!', e)
    }

    this.users = piliRTC.users
  }
}
