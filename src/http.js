/**
 * Created by superman on 17/2/16.
 * http配置
 */

import axios from 'axios'
import store from './store/store'
import * as types from './store/types'
import router from './router'
import ElementUI from 'element-ui'

// axios 配置
// axios.defaults.timeout = 50000
// axios.defaults.baseURL = 'https://api.github.com'

// http request 拦截器
axios.interceptors.request.use(
    config => {
        if (store.state.token) {
            config.headers.Authorization = `token ${store.state.token}`
        }
        if (config.method === 'get') {
            config.params = {
                _t: Date.parse(new Date()) / 1000,
                ...config.params
            }
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

// http response 拦截器
axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 401 清除token信息并跳转到登录页面
                    store.commit(types.LOGOUT)

                    // 只有在当前路由不是登录页面才跳转
                    router.currentRoute.path !== 'login' &&
                        router.replace({
                            path: 'login',
                            query: { redirect: router.currentRoute.path }
                        })
                case 500:
                    document.querySelector('.el-loading-mask').style.display = 'none'
                    ElementUI.Message({
                        message: '接口请求异常,请联系管理员',
                        type: 'warning'
                    })
                    break
            }
        }
        // console.log(JSON.stringify(error));//console : Error: Request failed with status code 402
        return Promise.reject(error.response)
    }
)

export default axios