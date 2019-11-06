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
      if(res.data.state == 100){
        console.log(2222)
        this.loginrole = res.data.roleName;
      }
    })
  }
  changeCode () {
    this.codeSrc = '/api/main/code.jhtml?tm=' + Math.random()
  }

  handleLogin () {
    this.loading = true
    switch (this.userType) {
      case 'judge':
        this.login(this.judgeLoginForm).then(res => {
          this.loading = false;
          if (res.data.state === 100) {
            
            if(res.data.data.roles.length == 1){
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
            }else{
              this.rList = res.data.data.roles;
              this.isSel = true;
            }
          }  else if (res.data.state === 103) {
            this.$swal({
              title: '请用微信扫码进行实名认证',
              imageUrl: res.data.data.imagePath,
              imageWidth: 300,
              imageHeight: 300,
              confirmButtonText: "好的"
            });
          }else {
            this.$swal({
              type: 'error',
              title: res.data.message
            })
          }
        })
        break
      case 'litigant':
        this.login(this.litigantLoginForm).then(res => {
          this.loading = false
          if (res.data.state === 100) {
            
            if(res.data.data.roles.length == 1){
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
            }else{
              this.rList = res.data.data.roles;
              this.isSel = true;
            }
            
          }  else if (res.data.state === 103) {
            this.$swal({
              title: '请用微信扫码进行实名认证',
              imageUrl: res.data.data.imagePath,
              imageWidth: 300,
              imageHeight: 300,
              confirmButtonText: "好的"
            });
          }else {
            this.$swal({
              type: 'error',
              title: res.data.message
            })
          }
        })
        break
    }
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
  selRole(type,id){
    let that = this;
    this.optionRole(type).then(res => {
      that.isSel = false;
      if(res.data.state === 100){
        localStorage.setItem('roleIdToken',id);
        this.searchForm.pageNumber = 1;
        this.getNowPageContent();
        // that.searchCaseList(this.searchForm)
        console.log(res.data.data.isFace)
        if (res.data.data.isFace) {
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
  selectClick(event,my){
    this.delSelect(event,this.selectedCase,this.caseList,my)
  }

  delSelect(event,selectList,caseList,that){ //处理选择的数据
    let list=selectList
    if(event){//是否选中
        that.checked=true;
        list.push(that)
        this.setSelectList({caseList:list})
    }else{//取消选中删除
      list.forEach((item,index) => {//循环选择项
        if(item.caseId==that.caseId){//根据id找到该条删除
          list.splice(index,1);
        }
      });
      this.setSelectList({caseList:list})//更新选择项
    }
    console.log(this.selectedCase)
  }

  backToLogin () {
    this.logout()
  }

  setPageData(pageNumber,  total) {//设置分页参数
    this.pageData = {
      pageNumber,
      total,
      size:7
    }
  }

  async getNowPageContent(){//获取当前页内容
    console.log(this.searchForm)
    let res = await this.searchCaseList(this.searchForm)
    console.log(res)
    let data = res.data;
    this.setPageData(this.searchForm.pageNumber, data.total)
  }

  serachByCaseNo () {
    this.searchForm.pageNumber = 1;
    this.getNowPageContent();
    // this.searchCaseList(this.searchForm)
  }
  selectAll(e,list,selectList){//全选
    this.setSelectAllRes({state:e})
    if(e){//是否选中
      for(let item of list){
        if(!item.checked){
          item.checked=true;
          selectList.push(item)
        }
        
      }
    }else{//取消选中
      list.forEach((item,index) => {
        item.checked=false;
        selectList.forEach((item1,index1) => {
          if(item.caseId==item1.caseId){//根据id找到该条删除
            selectList.splice(index1,1);
          }
        });
      });
    }
  }

  openCourtClerk(e){
    console.log(e)
    if(e == ''){
      this.$alert('您还未选中任何案件！', '', {
        confirmButtonText: '确定',
        callback: action => {
        }
      });
      return false;
    }
    let ary = [];
    let arr = [];
    this.clerkBatcnRooms.map(item => {
      if(item[0].roomKey == e){
        arr = item;
        item.map(it => {
          ary.push(it.caseId)
        })
      }
    })
    this.setclerkRooms({caseList:arr});
    let str = '';
    str=ary.join(',');
    let data = {
      caseNo:'批量开庭',
      caseId:str,
      noTips:true
    }
    this.roomToken(data);
  }

  openCourt(e){//批量庭审
    console.log(this.loginrole)
    if(this.selectedCase.length==0){
      this.$alert('您还未选中任何案件！', '', {
        confirmButtonText: '确定',
        callback: action => {
        }
      });
      return
    }
    var caseIds=[]
    var str=''
    this.selectedCase.forEach((item,index)=>{
      caseIds.push(item.caseId)
    })
    str=caseIds.join(',');
    let data = {
      caseNo:'批量开庭',
      caseId:str,
      noTips:true
    }
    this.roomToken(data);
    // this.openCourtUrl("rtc",str)
  }

  roomToken (obj) {
    // 记录选择的caseNo
    this.setCaseNo(obj.caseNo)
    let parmas={
        caseid:obj.caseId,
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
  delSelectCase(it,list){//删除
    let waitList=this.selectedCase
    waitList.forEach((item,index)=>{
      if(it.caseId==item.caseId){
        waitList.splice(index,1);//删除对应项
      }
    })
    this.setSelectList({caseList:waitList})
    //取消选择
    for(let value of list){
      if(it.caseId==value.caseId){
        value.checked=false;
        // this.setCaseList({caseList:allWaitList})
        break
      }
    }
  }
  clearAll(list){//清除全部
    //取消选择
    for(let item of  this.selectedCase){
      for(let item1 of list){
        if(item.caseId==item1.caseId){
          item1.checked=false;//列表项取消选择
          break
        }
      }
    }
    this.setSelectList({caseList:[]})//清空选择项
  }
roomTokenTest (obj) {
    // 记录选择的caseNo
    this.setCaseNo(obj.caseNo)
    this.loading = true
    // 查询房间token
    let parmas={
        caseid:obj.caseId,
        roomType:0
    }
    this.getRoomToken(parmas).then(res => {
      this.loading = false
      if (res.data.state === 100) {
        this.setWebsocket()
        // this.websocket.refresh()
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
        // this.$router.push({
        //   name: 'roomPage'
        // })
      } else {
        this.$swal({
          type: 'error',
          title: res.data.message
        })
      }
    })
  }
}
