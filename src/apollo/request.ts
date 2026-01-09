import { apolloClient } from './index'

/**
 * 封装异步 Query
 * @param query GQL 查询语句
 * @param variables 参数
 */
export async function queryAsync<T = any>(query: any, variables: object = {}) {
  try {
    const response = await apolloClient.query<T>({
      query,
      variables
      // fetchPolicy: 'network-only', // 如果不需要缓存，开启此项
    })
    return response.data
  } catch (error) {
    // 可以在这里统一处理错误逻辑
    console.error('GraphQL Query Error:', error)
    throw error
  }
}
