import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'
import { AtomSpinner } from 'epic-spinners'
import { getUserInfo } from '../../api/user'

import RWS from '../../utils/rws'

import './recordRoom.less'




interface CaseObjectShape {
  id: number,
  caseNo: string,
  isOpen: number
}


@Component({
  template: require('./recordRoom.html'),
  components: {
    VueParticles,
    AtomSpinner,
  }
})

export class RecordRoom extends Vue {
    // @Getter('getLoginState') hasLogin: boolean
    @Getter('getFaceCheckState') hasFaceCheck: boolean
    @Getter('getSelectedCase') selectedCase: Array<any>
    @Getter('getclerkBatcnRooms') clerkBatcnRooms: Array<any>
    @Getter('getSelectAllCase') endCheck: boolean
    @Action('login') login: Function
    @Action('phoneLogin') phoneLogin: Function
    @Action('optionRole') optionRole: Function
    @Action('getCode') getCodeApi: Function
    @Action('logout') logout: Function
    @Action('searchCaseList') searchCaseList: Function
    @Action('getRoomToken') getRoomToken: Function
    @Action('setCaseNo') setCaseNo: Function
    @Getter('getWebsocket') websocket: RWS
    @Action('setWebsocket') setWebsocket: Function
    @Action('setSelectList') setSelectList: Function
    @Action('setSelectAllRes') setSelectAllRes: Function
    @Action('setclerkRooms') setclerkRooms: Function

    // @Action('login') login:Function
    // @Action('getHallList') getHallList:function
    // @Action('logout') logout:Function
    

    totalPage: number = 9
    loading: boolean = false
    isSel: boolean = false
    nowSelTab:string = ''
    selected: boolean = false
    batchRoomsShow: boolean = false
    loginrole:string = ''
    rList: Array<any> = []
    // 用户类型 judge or litigant

  caseList2: Array<any> =  [
    {id:'1',name:'莲花村',isOpen:true},
    {id:'2',name:'莲花村',isOpen:false},
    {id:'3',name:'莲花村',isOpen:true},
    {id:'4',name:'莲花村',isOpen:false},
    {id:'5',name:'莲花村',isOpen:true},
    {id:'6',name:'莲花村',isOpen:false},
  ]
  caseNo:string = 'adsfasdfsadfdsa'
  baseInfoShow:boolean = false
  justiceBureau:string = 'sdasadfasfdsafd'
  mediationTime:string = '20191112'
  applicant: any = {
    name:'safdas',
    id_card: '111',
    address: 'xxx0',
    phone: '111',
    type: '2'
  }
  respondent:any = {
    name:'safdas',
    id_card: '111',
    address: 'xxx0',
    phone: '111',
    type: '3'
  }

  mounted () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.7)'
    });
    getUserInfo().then(res => {
      loading.close();
      console.log(res.data);
      // if(res.data.state == 100){
      //   this.$store.commit('hasLogin',true);
      // }else{
      //   this.$store.commit('hasLogin',false);
      // }
    })
    .catch(error => {
      alert(error);
    })
  }
  back(){
    this.$router.push({
      name: 'loginPage'
    })
  }
  pageChange(nowPage){
    console.log(nowPage);
  }
  closeWindow(){
    this.baseInfoShow = false;
  }
  getRecord(id){
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.7)'
    });
    this.baseInfoShow = true;
  }
}
