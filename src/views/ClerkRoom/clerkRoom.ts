import { Component, Vue,Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { MainPlayer } from '../../components/MainPlayer'
import { LocalPlayer } from '../../components/LocalPlayer'
import { ClerkRemotePlayer } from '../../components/ClerkRemotePlayer'
import { ClerkChat } from '../../components/ClerkChat'
import { EvidenceWindow } from '../../components/EvidenceWindow'
import { WorkerWindow } from '../../components/WorkerWindow'
import { CourtWindow } from '../../components/CourtWindow'
import { ClerkWindow } from '../../components/ClerkWindow'
import { piliRTC } from '../../utils/pili'
import { deviceManager } from 'pili-rtc-web'
import { exportLog,closeRoom, } from '../../api/export'
import { finish,createImg } from '../../api/case'
import RWS from '../../utils/rws'

import './clerkRoom.less'

interface UserInfoShape {
  id: number,
  name: string,
  role: string,
}

@Component({
    template: require('./clerkRoom.html'),
    components: {
        MainPlayer,
        LocalPlayer,
        ClerkRemotePlayer,
        ClerkChat,
        EvidenceWindow,
        WorkerWindow,
        CourtWindow,
        ClerkWindow
    }
})

export class ClerkRoom extends Vue {
  @Getter('getRoomToken') roomToken: string
  @Mutation('SET_USERID') setUserId: Function
  @Getter('getUserId') userId: string
  @Getter('getMessage') logMessage: Array<any>
  @Getter('getclerkRooms') clerkRooms: Array<any>
  @Getter('getCaseNo') caseNo: string
  @Getter('getCaseId') caseId: number
  @Getter('getMainInfo') mainInfo: any
  @Getter('getUserInfo') userInfo: UserInfoShape
  @Action('cleanMessage') cleanMsg: Function
  @Getter('getWebsocket') websocket: RWS
  @Action('setVideoSrcObj') setVideoSrcObj: Function

  users: Array<any> = []
  evidenceShow: boolean = false
  workerShow: boolean = false
  clerkShow: boolean = false
  courtShow: boolean = false
  targetShow: string = ''
  logShow: boolean = false
  message: string = ''
  windowIsShowClass: string = ''
  week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  clock = {
    date: '',
    time: '',
    week: ''
  }
  timer: any
  stream: any = {}
  isReadWindow: boolean = true
  totalTime: number = 7
  canClick: boolean = true
  isCheck: boolean =true
  content: string = '明白'
  show1: boolean = true
windowIsshow: boolean = true
  @Watch('mainInfo')
  onChildChanged(val: any, oldVal: any) {
      console.log(val)
      console.log(oldVal)
      if (val.roleName!='法官') {
        this.windowIsShowClass='show'
      }else{
        this.windowIsShowClass=''
      }
      console.log(this.users)
  }
created () {
  console.log(this.clerkRooms)
    // 情况语音列表
    this.cleanMsg()
    this.content = this.totalTime + 's后可关闭'
    let clock = window.setInterval(() => {
        this.totalTime--
        this.content = this.totalTime + 's后可关闭'
        if (this.totalTime < 0) {
        window.clearInterval(clock)
        this.content = '明白'
    }
    },1000)
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)

    piliRTC.on('user-join', user => {
      console.log('user-join')
      console.log(this.users)
      
      this.users.map((item, index) => {
        if (!item.published) this.users.splice(index, 1)
      })
    })
    piliRTC.on('user-publish', user => {
      console.log('user-publish')
      this.users.push(user)
    })
    piliRTC.on('user-unpublish', user => {
      console.log('user-unpublish')
      this.users.map((item, index) => {
        if (item.userId === user.userId) this.users.splice(index, 1)
      })
    })
  }
  async mounted () {
    // 进入房间
    try {
      console.log('joinRoomWithToken')
      const roomInfo = await piliRTC.joinRoomWithToken(this.roomToken)
      console.log(roomInfo)
    } catch (e) {
      console.log('加入房间失败!', e)
    }
    try {
      const localStream = await deviceManager.getLocalStream({
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
      console.log('roompage getLocalStream')
      localStream.play((this.$refs.localPlayer as any).$el, true)
      // 本地推流 
      try {
        console.log('publish')
        if(this.userInfo.role != '书记员'){
          const publishInfo = await piliRTC.publish(localStream)
          this.setUserId(publishInfo.userId)
          this.setVideoSrcObj(localStream.mediaStream)
        }
        
        
      } catch (e) {
        console.log('本地推流失败!', e)
      }
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
    this.users = piliRTC.users
    console.log(56663)
    console.log(this.users)
    this.users.map((item, index) => {
      if (!item.published) this.users.splice(index, 1)
    })
  }

  destroyed () {
    piliRTC.leaveRoom()
    clearInterval(this.timer)
    this.websocket.close()
    piliRTC.removeAllListeners('user-join')
    piliRTC.removeAllListeners('user-publish')
    piliRTC.removeAllListeners('user-unpublish')
  }

  async endCourt () {
    this.$swal({
      title: '确认结束庭审',
      text: '结束庭审后案件将进入结案状态，无法再次开庭',
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
      confirmButtonText: '结束'
    }).then(res => {
      if (res.value) {
        finish().then(res => {
          if (res.data.state === 100) {
            this.$router.push({
              name: 'loginPage'
            })
          } else {
            this.swal({
              type: 'error',
              title: res.data.message
            })
          }
        })
      }
    })
  }

  async outRoom () {
    // exportLog(this.caseId).then(res => {
    //   console.log(res)
    // })
    closeRoom().then(res => {
      console.log(res)
    })
    this.$router.push({
      name: 'loginPage'
    })
  }
  exportlog () {
    exportLog(this.caseId).then(res => {
      if (res.data.state === 100) {
        let eleLink = document.createElement('a')
        let arr = res.data.result.split('/')
        eleLink.download = arr[arr.length - 1]
        eleLink.style.display = 'none'
        eleLink.href = location.origin + res.data.result
        // 触发点击
        document.body.appendChild(eleLink)
        eleLink.click()
        // 然后移除
        // document.body.removeChild(eleLink)
      } else {
        this.$swal({
          type: 'error',
          title: res.data.message
        })
      }
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

  jumpBigData () {
    window.open('/bigData/index.html')
  }
  signCheck(){
    //   console.log()
      //掉接口获取二维码路径
      createImg().then(res => {
        if (res.data.state === 100) {
          console.log(res)
          let QRCode=res.data.path
          this.$swal({
            title: '扫描二维码签名确认',
                html: "<img  src="+'/'+QRCode+" style='width:55%'>",
            // imageUrl: '/dist/images/tu-s.png',
            confirmButtonText: '好的',
            allowOutsideClick: false,
        })
        } else {
          this.$swal({
            type: 'error',
            title: res.data.message
          })
        }
      })
  }
  closeIsRead(){
      if (this.content=='明白') {
          if (this.isCheck) {
            this.isReadWindow=false
          }
        
      }
      
  }
  CheckItem(e){
      console.log(e.target.checked)
      this.isCheck=e.target.checked
  }
}
