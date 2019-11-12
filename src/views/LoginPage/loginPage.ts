import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'
import { AtomSpinner } from 'epic-spinners'
import { FaceCheck } from '../../components/FaceCheck'
import { getUserInfo,login,logout,getHallList } from '../../api/user'
import { SelectDialog } from '../../components/SelectDialog'
// import { clerkSelectDialog } from '../../components/clerkSelectDialog'
import md5 from 'md5'
import RWS from '../../utils/rws'

import './loginPage.less'


interface LoginFormShape {
  username: string
  password: string
  code: string
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
    // clerkSelectDialog
  }
})

export class LoginPage extends Vue {
    @Getter('getLoginState') hasLogin: boolean
    @Getter('getFaceCheckState') hasFaceCheck: boolean
    @Getter('getCaseList') caseList: CaseListShape
    @Getter('getSelectedCase') selectedCase: Array<any>
    // @Getter('getclerkBatcnRooms') clerkBatcnRooms: Array<any>
    @Getter('getSelectAllCase') endCheck: boolean
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
    // @Action('setclerkRooms') setclerkRooms: Function

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
    userType: string = 'judge'
    // 验证码
    codeSrc: string = '/api/main/code.jhtml'
    // 用户表单参数
    judgeLoginForm: LoginFormShape = {
        username: '',
        password: '',
        code: '',
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
  isLogin: boolean = false
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
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.7)'
    });
    loading.close();
    // getUserInfo().then(res => {
    //   console.log(res.data);
    //   loading.close();
    //   if(res.data.state == 100){
    //     this.isLogin = true;
    //   }else{
    //     this.isLogin = false;
    //   }
    // })
  }

  changeCode () {
    this.codeSrc = '/api/main/code.jhtml?tm=' + Math.random();
  }

  handleLogin () {
    this.loading = true
    login(this.judgeLoginForm.username,md5(this.judgeLoginForm.password),this.judgeLoginForm.code).then(res => {
      this.loading = false;
      if (res.data.state === 100) {
        this.$swal({
          type: 'success',
          title: res.data.message
        })
        this.loading = true;
        this.isLogin = true;
        getHallList('').then(res => {
          this.loading = false;
          console.log(res.data);
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

  backToLogin () {
    logout().then(res => {
      if(res.data.state == 100){
        this.isLogin = false;
        this.$swal({
          type: 'success',
          title: res.data.message
        })
      }else{
        this.$swal({
          type: 'error',
          title: res.data.message
        })
      }
    })
    .catch(error => {
      this.$swal({
        type: 'error',
        title: '网络错误'
      })
    })
  }

  serachByCaseNo(){

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
        this.$router.push({
          name: 'roomPage'
        })
        
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

  getRecord(id){
    this.$router.push({
      name: 'recordRoom'
    })
  }

  pageChange(pageNum){
    this.searchForm.pageNumber = pageNum;
  }

}
