import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { VueParticles } from '../../components/vue-particles'
import { AtomSpinner } from 'epic-spinners'
import { FaceCheck } from '../../components/FaceCheck'
import { getUserInfo,login,logout,getHallList } from '../../api/user'
import { intoRoom, } from '../../api/case'
import { SelectDialog } from '../../components/SelectDialog'
// import { clerkSelectDialog } from '../../components/clerkSelectDialog'
import md5 from 'md5'
import RWS from '../../utils/rws'

import './handDraw2.less'

@Component({
    template: require('./handDraw2.html'),
    components: {
        VueParticles,
        AtomSpinner,
    }
})

export class HandDraw2 extends Vue {
    

}
