import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class'
import { piliRTC } from '../../utils/pili'
// import { userDetail } from '../../api/user'

import './mainPlayer.less'

interface UserInfoShape {
    id: number,
    name: string,
    role: string
}

@Component({
    template: require('./mainPlayer.html')
})
export class MainPlayer extends Vue {
    @Getter('getVideoSrcObj') videoSrcObj: MediaStream
    @Getter('getMainInfo') mainInfo: any
    @Getter('getUserInfo') userInfo: UserInfoShape
    week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    clock = {
        date: '',
        time: '',
        week: ''
    }
    timer: any

    @Watch('videoSrcObj', { immediate: true, deep: true })
    autoPlay (val: MediaStream, oldVal: MediaStream) {
        const localVideo = this.$refs.video as HTMLVideoElement

        if (val.active) {
            localVideo.srcObject = this.videoSrcObj
        }
    }

    created () {
        this.timer = setInterval(() => {
            this.updateTime()
        }, 1000)
    }

    destroyed () {
        clearInterval(this.timer)
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
