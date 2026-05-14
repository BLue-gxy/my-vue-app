import http from './axios'

/**
 * get 请求封装
 */
export function get(url: string, params?: any, config?: any, onError?: (error: any) => void) {
  return http
    .get(url, { params, ...config })
    .then((res: any) => res)
    .catch((err) => {
      if (onError) {
        onError(err)
      }
      throw err
    })
}

/**
 * post 请求封装
 */
export function post(url: string, data?: any, config?: any, onError?: (error: any) => void) {
  return http
    .post(url, data, config)
    .then((res: any) => res)
    .catch((err) => {
      if (onError) {
        onError(err)
      }
      throw err
    })
}

/**
 * put 请求封装
 */
export function put(url: string, data?: any, config?: any, onError?: (error: any) => void) {
  return http
    .put(url, data, config)
    .then((res: any) => res)
    .catch((err) => {
      if (onError) {
        onError(err)
      }
      throw err
    })
}

/**
 * delete 请求封装
 */
export function del(url: string, params?: any, config?: any, onError?: (error: any) => void) {
  return http
    .delete(url, { params, ...config })
    .then((res: any) => res)
    .catch((err) => {
      if (onError) {
        onError(err)
      }
      throw err
    })
}
