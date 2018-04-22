import axios, { AxiosStatic } from 'axios'

interface UtilShape {
  axios?: AxiosStatic
}

let Util: UtilShape = {
  axios: axios.create({
    baseURL: '/api',
    timeout: 20000
  }) as AxiosStatic
}

export default Util
