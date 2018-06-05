import axios, { AxiosStatic, AxiosResponse } from 'axios'
import store from '../store/index'
import swal from 'sweetalert2'

interface UtilShape {
  axios?: AxiosStatic
}

let Util: UtilShape = {
  axios: axios.create({
    baseURL: '/api',
    timeout: 20000
  }) as AxiosStatic
}

// 设定子类的配置信息
Util.axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'

// 子类的拦截器，对结果是否正常做出判断
Util.axios.interceptors.response.use((response) => {
  return response
}, function (error) {
  console.log(error.response.status)
  if (401 === error.response.status || 302 === error.response.status) {
    swal({
      title: '该账户他人已被登入',
      text: '即将跳回登录页！！',
      type: 'warning',
      timer: 2000
    }).then(res => {
      store.dispatch('logout')
    })
  } else {
    return Promise.reject(error)
  }
})
export default Util
