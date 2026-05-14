import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' }
})

// 请求拦截器
http.interceptors.request.use(
  async (config: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { data, config } = response
    return data
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export default http
