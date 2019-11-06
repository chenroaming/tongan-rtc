import Util from '../utils/util'

let service = Util.axios

export function resultList () {
  return service({
    url: '/online/resultList.jhtml',
    method: 'get'
  })
}

export function addResult (fileName, content) {
  let data = {
    fileName,
    content
  }
  return service({
    url: '/online/addResult.jhtml',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }]
  })
}

export function getResult (resultId) {
  let params = {
    resultId
  }
  return service({
    url: 'online/getResult.jhtml',
    method: 'get',
    params
  })
}

export function delResult (resultId) {
  let params = {
    resultId
  }
  return service({
    url: 'online/delResult.jhtml',
    method: 'get',
    params
  })
}

export function editResult (resultId, fileName, content) {
  let data = {
    resultId,
    fileName,
    content
  }
  return service({
    url: '/online/editResult.jhtml',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }]
  })
}
