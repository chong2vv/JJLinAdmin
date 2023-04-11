import axios from 'axios'
import { Message } from 'element-ui'

const transformResponse = function(res) {
  /* eslint-disable*/
  res = res.replace(/\"id\":(\d+)/g, '"id":"$1"')
  return JSON.parse(res)
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_UPLOAD_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  transformResponse,
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'multipart/form-data'
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service