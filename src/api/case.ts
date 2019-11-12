import Util from '../utils/util'

let service = Util.axios

/**
 * [通过案号查询按键列表接口]
 * @param {string} caseNo [案号]
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function caseList (caseNo,pageNumber) {
  const params = {
    caseNo,
    pageNumber
  }
  return service({
    url: '/online/caseList.jhtml',
    method: 'get',
    params
  })
}

export function getRoomToken (caseId,roomType) {
  const params = {
    caseId,
    roomType
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
export function createImg () {
    return service({
      url: '/online/createImg.jhtml',
      method: 'get'
    })
  }

  /**
 * [进入房间新]
 * @param {string}
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function intoRoom (hallId) {
  const params = {
    hallId //房间id
  }
  return service({
    url: '/mediate/intoRoom.jhmel',
    method: 'post',
    params
  })
}


  /**
 * [退出房间新]
 * @param {string} 
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function closeRoom (recordId) {
  const params = {
    recordId //调解记录id
    
  }
  return service({
    url: '/mediate/closeRoom.jhtml',
    method: 'post',
    params
  })
}

/**
 * [开始调解新]
 * @param {string} hallId [议理堂]
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function startMediate (hallId,pant1,pant2,judicialId) {
  const params = {
    hallId,//议理堂
    pant1,//申请人id
    pant2,//被申请人id
    judicialId//司法局id
    
  }
  return service({
    url: '/mediate/startMediate.jhtml',
    method: 'post',
    params
  })
}


/**
 * [查询法院/司法院/申请人/被申请人新]
 * @param {string} caseNo [案号]
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function getByRoomId (roomId,type) {
  const params = {
    roomId,
    type//0法院 1司法院 2申请人 3被申请人
    
  }
  return service({
    url: '/participant/getByRoomId.jhtml',
    method: 'get',
    params
  })
}


/**
 * [根据id查询参与人新]
 * @param {string} pantId [申请人Id]
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function getById (pantId) {
  const params = {
    pantId
  }
  return service({
    url: '/participant/getById.jhtml',
    method: 'get',
    params
  })
}

/**
 * [新增修改参与人新]
 * @param {string}
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function changePar (pantId,type,name,phone,idCard,address) {
  const params = {
    pantId,
    type,
    name,
    phone,
    idCard,
    address
  }
  return service({
    url: '/participant/changePar.jhtml',
    method: 'post',
    params
  })
}


/**
 * [删除参与人新]
 * @param {string} caseNo [案号]
 * @returns { state: number, message: string } [state:100 成功；101 失败]
 */
export function delParticipant (pantId) {
  const params = {
    pantId
  }
  return service({
    url: '/participant/delParticipant.jhmtl',
    method: 'post',
    params
  })
}