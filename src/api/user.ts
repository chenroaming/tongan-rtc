import Util from '../utils/util'

let service = Util.axios

/**
 * [用户登入接口]
 * @param username [用户名]
 * @param password [密码]
 * @param code     [验证码]
 * @return { state, message } [state:100 登入成功；101 登入失败]
 */
export function login (username, password, code) {
  const data = {
    username,
    password,
    code
  }
  return service({
    url: '/main/login.jhtml',
    method: 'post',
    data
  })
}

export function getUserInfo () {
  return service({
    url: '/main/getUserInfo.jhtml',
    method: 'get'
  })
}
