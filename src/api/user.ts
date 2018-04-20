import Util from '../utils/util'

let server = Util.axios

export function login (username, password, code) {
  const data = {
    username,
    password,
    code
  }
  return server({
    url: '/main/login.jhtml',
    method: 'post',
    data
  })
}
