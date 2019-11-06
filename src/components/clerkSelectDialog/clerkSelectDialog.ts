import { Component, Vue ,Prop } from 'vue-property-decorator'
import { Getter, Action ,Mutation} from 'vuex-class'

interface UserInfoShape {
    id: number,
    name: string,
    role: string
}

@Component({
  template: require('./clerkSelectDialog.html')
})
export class clerkSelectDialog extends Vue {
    @Getter('getUserInfo') mainInfo: UserInfoShape
    name: 'clerkSelectDialog'
    // myShow: boolean = dialogShow

    @Prop(
        {
            type: Array, // 父组件传递给子组件的数据类型
            required: false, // 是否必填
            default: ()=>([]) // 默认值， 如果传入的是 Object，则要 default: ()=>({}) 参数为函数
        }
    ) selectList!:Array<any>

    @Prop(
        {
            type: Boolean, // 父组件传递给子组件的数据类型
            required: false, // 是否必填
            default: ()=>(false) // 默认值， 如果传入的是 Object，则要 default: ()=>({}) 参数为函数
        }
    ) dialogShow!:boolean

    // @Prop(
    //     {
    //         type: String, // 父组件传递给子组件的数据类型
    //         required: false, // 是否必填
    //         default: ()=>(false) // 默认值， 如果传入的是 Object，则要 default: ()=>({}) 参数为函数
    //     }
    // ) nowSelTab!:''

    nowSelTab: String = ''

    handleClose(done) {//关闭
        this.$emit('closeDialog')
    }
    getTabs(t){
        console.log(t)
        this.nowSelTab = t;
    }

    delItem(item){//删除案件
       console.log("66622",item)
       this.$emit('delCase',item)
    }

    openCourt(type){//批量开庭
        console.log(this.nowSelTab)
        // let it = parseInt(this.nowSelTab);
        // console.log(this.selectList[it])
       this.$emit('openCourt',this.nowSelTab)
    }

    clearAll(){//清除全部
       this.$confirm('确认清空选择的案件？')
       .then(_ => {
       // done();
       this.$emit('clearAll')
       })
       .catch(_ => {});
    }
}
