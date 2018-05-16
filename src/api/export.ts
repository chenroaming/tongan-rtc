import Util from '../utils/util'

let service = Util.axios

export function caseList (caseNo) {
  const params = {
    caseNo
  }
  return service({
    url: '/online/caseList.jhtml',
    method: 'get',
    params
  })
}
