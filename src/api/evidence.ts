import Util from '../utils/util'

let service = Util.axios

export function uploadEvi (formdata) {
  const data = formdata
  return service({
    url: '/qtw/out/evi/editEvi.jhtml',
    method: 'post',
    data
  })
}

export function getEviByCaseId (lawCaseId) {
  const params = {
    lawCaseId
  }
  return service({
    url: '/qtw/out/evi/getEviByCaseId.jhtml',
    method: 'get',
    params
  })
}
