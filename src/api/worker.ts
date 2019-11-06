import Util from '../utils/util'

let service = Util.axios

export function getWorkers (lawCaseId) {
  const params = {
    lawCaseId
  }
  return service({
    url: '/court/case/getJudgeImage.jhtml',
    method: 'get',
    params
  })
}
