import Util from '../utils/util'

let service = Util.axios

/**
 * [通过案号查询按键列表接口]
 * @param {string} caseNo [案号]
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
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

export function getRoomToken (caseId) {
  const params = {
    caseId
  }
  return service({
    url: '/online/getRoomToken.jhtml',
    method: 'get',
    params
  })
}

export function voice (blob) {
  const data = blob
  return service({
    url: '/online/voice.jhtml',
    method: 'post',
    data
  })
}

export function finish () {
  return service({
    url: '/online/finish.jhtml',
    method: 'get'
  })
}
