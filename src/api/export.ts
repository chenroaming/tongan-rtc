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

export function exportLog (caseId) {
  const params = {
    caseId
  }
  return service({
    url: '/online/saveTrialRecord.jhtml',
    method: 'get',
    params
  })
}
export function closeRoom () {
  return service({
    url: '/online/closeRoom.jhtml',
    method: 'get',
  })
}

/**
 * 上传清单模块中的证据
 */
export function uploadRecordFile (file, caseId) {
  let params = new FormData()
  // for(var i=0;i<file.length;i++){
  //     params.append('file', file[i])
  // }
  params.append('file', file)
  params.append('caseId',caseId)
  let config = {
    headers: { 'Content-Type': 'multipart/form-data' }
  }
  var str = '/online/uploadRecordFile.jhtml';
  var strs = encodeURI(str)
  return service.post(strs, params, config)
}
