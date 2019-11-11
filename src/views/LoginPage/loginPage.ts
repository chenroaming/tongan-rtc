import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'
import { AtomSpinner } from 'epic-spinners'
import { FaceCheck } from '../../components/FaceCheck'
import { getUserInfo } from '../../api/user'
import { SelectDialog } from '../../components/SelectDialog'
import { clerkSelectDialog } from '../../components/clerkSelectDialog'

import RWS from '../../utils/rws'

import './loginPage.less'


interface LoginFormShape {
  username: string
  password: string
  code: string
  loginType: string
}



interface SearchForm {
  caseNo: string,
  pageNumber: number,
  
}

interface CaseListShape {
  [index: number]: CaseObjectShape
}



interface PageData {
  pageNumber: number,
  total: number,
  size: number,
}

interface roleListShape {
  [index: number]: roleObjectShape
}

interface role {
  roleType: number,
}


interface roleObjectShape {
  id: number,
  type: number,
  name: string
}


interface CaseObjectShape {
  id: number,
  caseNo: string,
  isOpen: number
}

const TIME_COUNT: number = 60

@Component({
  template: require('./loginPage.html'),
  components: {
    VueParticles,
    AtomSpinner,
    FaceCheck,
    SelectDialog,
    clerkSelectDialog
  }
})

export class LoginPage extends Vue {
    @Getter('getLoginState') hasLogin: boolean
    @Getter('getFaceCheckState') hasFaceCheck: boolean
    @Getter('getCaseList') caseList: CaseListShape
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

    totalPage: number = 9
    loading: boolean = false
    isSel: boolean = false
    nowSelTab:string = ''
    selected: boolean = false
    batchRoomsShow: boolean = false
    loginrole:string = ''
    rList: Array<any> = []
    // 用户类型 judge or litigant
    userType: string = 'judge'
    // 验证码
    codeSrc: string = '/api/main/code.jhtml'
    // 用户表单参数
    judgeLoginForm: LoginFormShape = {
        username: '',
        password: '',
        code: '',
        loginType:'court',
    }
  
  

  litigantLoginForm: LoginFormShape = {
    username: '',
    password: '',
    code: '',
    loginType:'litigant',
  }
  caseList2: Array<any> =  [
    {id:'1',name:'莲花村',isOpen:true},
    {id:'2',name:'莲花村',isOpen:false},
    {id:'3',name:'莲花村',isOpen:true},
    {id:'4',name:'莲花村',isOpen:false},
    {id:'5',name:'莲花村',isOpen:true},
    {id:'6',name:'莲花村',isOpen:false},
  ]
  
  
  show: boolean = true
  count: number = 60
  timer: null | any = null

  pageData: PageData = {
    pageNumber: 1,
    total: 0,
    size:7
  }
  searchForm: SearchForm = {
    caseNo: '',
    pageNumber: this.pageData.pageNumber
  }

  mounted () {
    if (this.hasLogin) {
      this.getNowPageContent();
      // this.searchCaseList(this.searchForm)
    }
    getUserInfo().then(res => {
      console.log(res.data);
      // if(res.data.state == 100){
      //   this.$store.commit('hasLogin',true);
      // }else{
      //   this.$store.commit('hasLogin',false);
      // }
    })
  }

  // computed: {
  //   get(){
  //     return this.$store.getters.hasLogin;
  //   },
  //   set(val) {
  //     return this.$store.commit('hasLogin',val);
  //   }
  // }
  changeCode () {
    this.codeSrc = '/api/main/code.jhtml?tm=' + Math.random()
  }

  handleLogin () {
    this.loading = true
    this.login(this.judgeLoginForm).then(res => {
      this.loading = false;
      if (res.data.state === 100) {
        // this.$swal({
        //   type: 'success',
        //   title: res.data.message
        // })
        this.optionRole(res.data.data.roles[0].type).then(ress => {
          if(ress.data.state === 100){
            localStorage.setItem('roleIdToken',res.data.data.roles[0].id);
            this.searchForm.pageNumber = 1;
            this.getNowPageContent();
            // this.searchCaseList(this.searchForm)
            if (ress.data.data.isFace) {
              let child = this.$refs.faceChild as any
              child.startTrack()
            }
            getUserInfo().then(res => {
              if(res.data.state == 100){
                console.log(59595959595959595 + res.data.roleName)
                this.loginrole = res.data.roleName;
              }
            })
          }
        })
      }else {
        this.$swal({
          type: 'error',
          title: res.data.message
        })
      }
    })
    .catch(error => {
      this.$swal({
        type: 'error',
        title: '网络错误！'
      })
    })
  }

  selectedBtn(){
    this.selected = true;
  }
  getRoomsShow(){
    if(this.clerkBatcnRooms.length > 0){
      this.nowSelTab = this.clerkBatcnRooms[0][0].roomKey;
    }else{
      this.nowSelTab = "";
    }
    (this.$refs.clerkDialog as any).getTabs(this.nowSelTab)
    this.batchRoomsShow = true;
  }
  closeDialogClerk(){
    this.batchRoomsShow = false;
  }
  closeDialog(){
    this.selected = false;
  }
  
  getCode () {
    if (!this.timer) {
      this.getCodeApi(this.litigantLoginForm.username)
      this.count = TIME_COUNT
      this.show = false
      this.timer = setInterval(() => {
        if (this.count > 0 && this.count <= TIME_COUNT) {
          this.count--
        } else {
          this.show = true
          clearInterval(this.timer)
          this.timer = null 
        }
      }, 1000)
    }
  }

  backToLogin () {
    this.logout()
  }

  async getNowPageContent(){//获取当前页内容
    console.log(this.searchForm)
    let res = await this.searchCaseList(this.searchForm)
    console.log(res)
    let data = res.data;
  }

  serachByCaseNo () {
    this.searchForm.pageNumber = 1;
    this.getNowPageContent();
    // this.searchCaseList(this.searchForm)
  }

  roomToken (obj) {
    // 记录选择的caseNo
    this.setCaseNo(obj.caseNo)
    let parmas={
        caseid:'14b24cd09b61473fb3cbc425083549c7',
        roomType:1
    }
    this.loading = true
    // 查询房间token
    this.getRoomToken(parmas).then(res => {
      this.loading = false
      if (res.data.state === 100) {
        this.setWebsocket()
        // this.websocket.refresh()
        console.log(this.loginrole)
        if(this.loginrole == '书记员'){
          
          if(!obj.noTips){
            let ary = [];
            ary.push(obj)
            this.setclerkRooms({caseList:ary});
          }
          this.$router.push({
            name: 'clerkRoom'
          })
        }else{
          this.$router.push({
            name: 'roomPage'
          })
        }
        
      } else {
        console.log(obj.noTips)
        if(!obj.noTips){

        }else{
          console.log(11111111111)
          this.$alert(res.data.message, '', {
            confirmButtonText: '确定',
            callback: action => {
            }
          });
        }
        
        // this.$swal({
        //   type: 'error',
        //   title: res.data.message
        // })
      }
    })
  }
  pageChange(pageNum){
    this.searchForm.pageNumber = pageNum;
    this.getNowPageContent()
  }

}
