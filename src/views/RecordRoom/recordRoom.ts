import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'
import { AtomSpinner } from 'epic-spinners'
import { getUserInfo } from '../../api/user'
import { getRecord1,getRecord2,downloadPro } from '../../api/case'

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
    
    totalPage: number = 1
    loading: boolean = false
    isSel: boolean = false
    nowSelTab:string = ''
    selected: boolean = false
    batchRoomsShow: boolean = false
    loginrole:string = ''
    rList: Array<any> = []
    // 用户类型 judge or litigant

  caseList2: Array<any> =  []
  caseNo:string = ''
  baseInfoShow:boolean = false
  justiceBureau:string = ''
  mediationTime:string = ''
  endTime:string = ''
  applicant: any = {
    name:'',
    id_card: '',
    address: '',
    phone: '',
    type: ''
  }
  respondent:any = {
    name:'',
    id_card: '',
    address: '',
    phone: '',
    type: ''
  }
  nowId:string = ''
  eviShow:boolean = false
  eviList:Array<any> = []
  eviListpic:Array<any> = []
  picShow:boolean = false
  eviTitle:string = ''
  mounted () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.7)'
    });
    const hallId = window.localStorage.getItem('hallId');
    getUserInfo().then(res => {
      loading.close();
      console.log(res.data);
      if(res.data.state != 100){
        this.$router.push({
          name: 'login'
        })
      }
    })
    .catch(error => {
      this.$swal({
        type:'error',
        title:'网络错误！请刷新重试！'
      })
    })
    getRecord1(hallId,1,6).then(res => {
      if(res.data.state == 100){
        this.caseList2 = res.data.records.content;
        this.totalPage = res.data.records.totalPages;
      }
    })
  }
  back(){
    this.$router.push({
      name: 'loginPage'
    })
  }
  pageChange(nowPage){
    const hallId = window.localStorage.getItem('hallId');
    getRecord1(hallId,nowPage,6).then(res => {
      if(res.data.state == 100){
        this.caseList2 = res.data.records.content;
        this.totalPage = res.data.records.totalPages;
      }
    })
  }
  closeWindow(){
    this.baseInfoShow = false;
  }
  time(time = +new Date()) {//时间戳转换函数
    var date = new Date(time + 8 * 3600 * 1000); // 增加8小时
    return date.toJSON().substr(0, 19).replace('T', ' ').substring(0,16);
  }
  getRecord(id){
    this.nowId = id;
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.7)'
    });
    getRecord2(id).then(res => {
      loading.close();
      if(res.data.state == 100){
        this.eviList = res.data.record.proofs;
        if(res.data.record.participants.length > 0){
          this.caseNo = res.data.record.mediateNo;
          this.mediationTime = res.data.record.startTime ? this.time(res.data.record.startTime) : '';
          this.endTime = res.data.record.endTime ? this.time(res.data.record.endTime) : '';
          for (const item of res.data.record.participants){
            if(item.type == '2'){
              this.applicant.name = item.name;
              this.applicant.phone = item.phone;
              this.applicant.address = item.address;
              this.applicant.id_card = item.idCard;
            }
            if(item.type == '3'){
              this.respondent.name = item.name;
              this.respondent.phone = item.phone;
              this.respondent.address = item.address;
              this.respondent.id_card = item.idCard;
            }
            if(item.type == '1'){
              this.justiceBureau = item.name;
            }
          }
        }else{
          this.applicant.name = '';
          this.applicant.phone = '';
          this.applicant.address = '';
          this.applicant.id_card = '';
          this.respondent.name = '';
          this.respondent.phone = '';
          this.respondent.address = '';
          this.respondent.id_card = '';
          this.caseNo = '';
          this.mediationTime = '';
          this.endTime = '';
          this.justiceBureau = '';
        }
      }
    })
    this.baseInfoShow = true;
  }

  download(){
    downloadPro(this.nowId).then(res => {
      console.log(res.data);
      if(res.data.state == 100){
        // window.open(res.data.fileUrl);
        // window.open('https://view.officeapps.live.com/op/view.aspx?src='+res.data.fileUrl);
        const link = document.createElement('a');
        link.setAttribute("download", "");
        link.href = res.data.fileUrl;
        link.click();//点击直接下载文件
      }else if(res.data.state == 101){
        this.$swal({
          type:'error',
          title:res.data.message
        })
      }
    })
  }

  eviWatch(){
    this.eviShow = true;
  }

  watchEvi(index,No){
    console.log(this.eviList[index]);
    this.eviListpic = [];
    const picArr = this.eviList[index];
    for (const item of picArr.proofUrlSet){
      const obj = {
        src:'https://mediate.ptnetwork001.com' + item.path,
        // src:item.path,
      }
      this.eviListpic.push(obj);
    }
    this.picShow = true;
    this.eviTitle = '证据名称' + No;
  }
  
}
